import { STORYBOARD_3D_OBJECT_ANIMATION_PROPERTIES, getStoryboard3DObjectAnimationTrack, normalizeStoryboard3DShotAnimation, removeStoryboard3DAnimationKeyframe, sampleStoryboard3DShotAnimation, updateStoryboard3DShotAnimationSettings, upsertStoryboard3DCameraKeyframe, upsertStoryboard3DObjectKeyframe } from "./shotAnimation.js";
import { syncStoryboard3DCameraObjectFromShot } from "./projectModel.js";
const PROPERTY_LABELS = Object.freeze({
  position: "位置",
  rotation: "旋转",
  scale: "缩放"
});
const TOOL_PROPERTIES = Object.freeze({
  move: "position",
  rotate: "rotation",
  scale: "scale"
});
function escapeHtml(_0x320106) {
  return String(_0x320106 ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}
function clamp(_0x23c601, _0x59cae1, _0x87e20d) {
  return Math.min(_0x87e20d, Math.max(_0x59cae1, Number(_0x23c601) || 0));
}
function getSceneContext(_0x5c936a) {
  const _0x5ab919 = Array.isArray(_0x5c936a?.scenes) ? _0x5c936a.scenes : [];
  const _0x542fa6 = _0x5ab919.find(_0x426be7 => _0x426be7.id === _0x5c936a?.activeSceneId) || _0x5ab919[0] || null;
  const _0x5695b5 = Array.isArray(_0x542fa6?.shots) ? _0x542fa6.shots : [];
  const _0x537465 = _0x5695b5.find(_0x20b2c8 => _0x20b2c8.id === _0x542fa6?.activeShotId) || _0x5695b5[0] || null;
  return {
    scene: _0x542fa6,
    shot: _0x537465
  };
}
function createObjectTransforms(_0x3f9252) {
  return Object.fromEntries((_0x3f9252?.objects || []).map(_0x3968a3 => [_0x3968a3.id, _0x3968a3.transform]));
}
function cloneCameraState(_0x1c5b8b) {
  return {
    ..._0x1c5b8b,
    position: [..._0x1c5b8b.position],
    target: [..._0x1c5b8b.target]
  };
}
function normalizeAnimation(_0x10de4f, _0x23b61b) {
  return normalizeStoryboard3DShotAnimation(_0x23b61b?.animation, {
    camera: _0x23b61b?.camera,
    objectIds: new Set((_0x10de4f?.objects || []).map(_0x40097d => _0x40097d.id)),
    objectTransforms: createObjectTransforms(_0x10de4f)
  });
}
function getKeyframeCount(_0xf6426f) {
  return _0xf6426f.cameraKeyframes.length + _0xf6426f.objectTracks.reduce((_0x4ba5dd, _0x2b8066) => _0x4ba5dd + STORYBOARD_3D_OBJECT_ANIMATION_PROPERTIES.reduce((_0x487a15, _0x8efa03) => _0x487a15 + _0x2b8066[_0x8efa03 + "Keyframes"].length, 0), 0);
}
function formatFrameTime(_0x5c00c4, _0x539d8f) {
  return Math.round(_0x5c00c4 * _0x539d8f) + "f";
}
function renderKeyframes(_0x50e4e6, _0x443587, _0x3571ab = {}) {
  return _0x50e4e6.map(_0x2f75d6 => {
    const _0x293fa7 = _0x443587.duration > 0 ? _0x2f75d6.time / _0x443587.duration * 100 : 0;
    const _0x43dffa = _0x3571ab.keyframeId === _0x2f75d6.id;
    return "<button type=\"button\" class=\"storyboard-3d-timeline-keyframe " + (_0x43dffa ? "is-selected" : "") + "\" style=\"--storyboard-3d-keyframe-position:" + _0x293fa7 + "%\" data-storyboard-3d-action=\"timeline-select-keyframe\" data-keyframe-id=\"" + escapeHtml(_0x2f75d6.id) + "\" data-keyframe-type=\"" + escapeHtml(_0x3571ab.type || "") + "\" data-object-id=\"" + escapeHtml(_0x3571ab.objectId || "") + "\" data-property=\"" + escapeHtml(_0x3571ab.property || "") + "\" data-keyframe-time=\"" + _0x2f75d6.time + "\" aria-label=\"关键帧 " + _0x2f75d6.time.toFixed(2) + " 秒，第 " + formatFrameTime(_0x2f75d6.time, _0x443587.fps) + "\" title=\"" + _0x2f75d6.time.toFixed(2) + "s · " + formatFrameTime(_0x2f75d6.time, _0x443587.fps) + "\"></button>";
  }).join("");
}
function renderPropertyLinks(_0x3ecd43, _0x350c2f) {
  return STORYBOARD_3D_OBJECT_ANIMATION_PROPERTIES.map(_0x282df5 => "<button type=\"button\" class=\"storyboard-3d-timeline-property-link " + (_0x350c2f === _0x282df5 ? "is-active" : "") + "\" data-storyboard-3d-action=\"timeline-set-object-property\" data-object-id=\"" + escapeHtml(_0x3ecd43) + "\" data-property=\"" + _0x282df5 + "\">" + PROPERTY_LABELS[_0x282df5] + "</button>").join("<span aria-hidden=\"true\">/</span>");
}
function renderAddKeyframeButton({
  action: _0x54acdb,
  label: _0x29e9f2,
  objectId = "",
  property = ""
}) {
  return "<button type=\"button\" class=\"storyboard-3d-timeline-row-add\" data-storyboard-3d-action=\"" + _0x54acdb + "\" data-object-id=\"" + escapeHtml(objectId) + "\" data-property=\"" + escapeHtml(property) + "\" aria-label=\"为" + escapeHtml(_0x29e9f2) + "添加关键帧\" title=\"为" + escapeHtml(_0x29e9f2) + "添加关键帧\">+</button>";
}
function renderTimelineLane({
  animation: _0x6a90cf,
  keyframes: _0xacdc58,
  selection: _0x261f47,
  className = "",
  label: _0x5ee7c6
}) {
  return "<div class=\"storyboard-3d-timeline-lane " + className + "\" data-timeline-lane-label=\"" + escapeHtml(_0x5ee7c6 || "") + "\">\n    <span class=\"storyboard-3d-timeline-lane-line\" aria-hidden=\"true\"></span>\n    " + renderKeyframes(_0xacdc58, _0x6a90cf, _0x261f47) + "\n  </div>";
}
function renderCameraTrack(_0x400061, _0x448a06) {
  return "<div class=\"storyboard-3d-timeline-row is-camera\">\n    <div class=\"storyboard-3d-timeline-track-label\">\n      <div><strong>摄像机</strong><small>位置 / 目标 / 焦距</small></div>\n      " + renderAddKeyframeButton({
    action: "timeline-add-camera-keyframe",
    label: "摄像机"
  }) + "\n    </div>\n    " + renderTimelineLane({
    animation: _0x400061,
    keyframes: _0x400061.cameraKeyframes,
    selection: {
      ..._0x448a06,
      type: "camera"
    },
    className: "is-camera",
    label: "摄像机"
  }) + "\n  </div>";
}
function renderObjectTrack({
  object: _0x535714,
  animation: _0x30f06d,
  activeProperty: _0x47bd5e,
  expanded: _0x258718,
  selected: _0x46c1ad,
  selectedKeyframe: _0x158515
}) {
  const _0x1e826b = getStoryboard3DObjectAnimationTrack(_0x30f06d, _0x535714.id) || {
    positionKeyframes: [],
    rotationKeyframes: [],
    scaleKeyframes: []
  };
  const _0x4e8c24 = _0x535714.name + " · " + PROPERTY_LABELS[_0x47bd5e];
  const _0x3d043d = "<div class=\"storyboard-3d-timeline-object-summary " + (_0x46c1ad ? "is-selected" : "") + "\">\n    <button type=\"button\" class=\"storyboard-3d-timeline-disclosure " + (_0x258718 ? "is-expanded" : "") + "\" data-storyboard-3d-action=\"timeline-toggle-object\" data-object-id=\"" + escapeHtml(_0x535714.id) + "\" aria-label=\"" + (_0x258718 ? "折叠" : "展开") + escapeHtml(_0x535714.name) + "轨道\" aria-expanded=\"" + _0x258718 + "\">" + (_0x258718 ? "折叠" : "展开") + "</button>\n    <div><strong>" + escapeHtml(_0x535714.name) + "</strong><span>" + renderPropertyLinks(_0x535714.id, _0x47bd5e) + "</span></div>\n    " + (_0x258718 ? "" : renderAddKeyframeButton({
    action: "timeline-add-object-keyframe",
    label: _0x4e8c24,
    objectId: _0x535714.id,
    property: _0x47bd5e
  })) + "\n  </div>";
  if (!_0x258718) {
    return "<div class=\"storyboard-3d-timeline-row is-object is-" + _0x47bd5e + " " + (_0x46c1ad ? "is-selected" : "") + "\">\n      " + _0x3d043d + "\n      " + renderTimelineLane({
      animation: _0x30f06d,
      keyframes: _0x1e826b[_0x47bd5e + "Keyframes"],
      selection: {
        ..._0x158515,
        type: "object",
        objectId: _0x535714.id,
        property: _0x47bd5e
      },
      className: "is-" + _0x47bd5e,
      label: _0x4e8c24
    }) + "\n    </div>";
  }
  const _0x4c6e93 = STORYBOARD_3D_OBJECT_ANIMATION_PROPERTIES.map(_0x49e731 => "<div class=\"storyboard-3d-timeline-row is-object-property is-" + _0x49e731 + "\">\n      <div class=\"storyboard-3d-timeline-property-label\"><span aria-hidden=\"true\"></span>" + PROPERTY_LABELS[_0x49e731] + renderAddKeyframeButton({
    action: "timeline-add-object-keyframe",
    label: _0x535714.name + " · " + PROPERTY_LABELS[_0x49e731],
    objectId: _0x535714.id,
    property: _0x49e731
  }) + "</div>\n      " + renderTimelineLane({
    animation: _0x30f06d,
    keyframes: _0x1e826b[_0x49e731 + "Keyframes"],
    selection: {
      ..._0x158515,
      type: "object",
      objectId: _0x535714.id,
      property: _0x49e731
    },
    className: "is-" + _0x49e731,
    label: _0x535714.name + " · " + PROPERTY_LABELS[_0x49e731]
  }) + "\n    </div>").join("");
  return "<div class=\"storyboard-3d-timeline-object-group " + (_0x46c1ad ? "is-selected" : "") + "\">\n    <div class=\"storyboard-3d-timeline-row is-object-summary\">" + _0x3d043d + "<div class=\"storyboard-3d-timeline-lane is-summary\"></div></div>\n    " + _0x4c6e93 + "\n  </div>";
}
function renderRuler(_0x1a9181, _0x48bf6d) {
  const _0x31b74e = 6;
  const _0x1b51e0 = Array.from({
    length: _0x31b74e + 1
  }, (_0x3fa4de, _0x317602) => {
    const _0x5bead5 = _0x1a9181.duration * _0x317602 / _0x31b74e;
    return "<span style=\"--storyboard-3d-tick-position:" + _0x317602 / _0x31b74e * 100 + "%\"><strong>" + _0x5bead5.toFixed(_0x5bead5 % 1 === 0 ? 0 : 1) + "s</strong><small>" + formatFrameTime(_0x5bead5, _0x1a9181.fps) + "</small></span>";
  }).join("");
  return "<div class=\"storyboard-3d-timeline-row is-ruler\">\n    <div class=\"storyboard-3d-timeline-ruler-label\">轨道</div>\n    <div class=\"storyboard-3d-timeline-ruler\">\n      " + _0x1b51e0 + "\n      <input type=\"range\" min=\"0\" max=\"" + _0x1a9181.duration + "\" step=\"" + 1 / _0x1a9181.fps + "\" value=\"" + _0x48bf6d + "\" data-storyboard-3d-timeline-scrubber aria-label=\"镜头动画播放头\">\n    </div>\n  </div>";
}
function findSelectedKeyframe(_0x470b53, _0x1461b1) {
  if (!_0x1461b1?.keyframeId) {
    return null;
  }
  if (_0x1461b1.type === "camera") {
    const _0x6ddc8f = _0x470b53.cameraKeyframes.find(_0xffdf07 => _0xffdf07.id === _0x1461b1.keyframeId);
    if (_0x6ddc8f) {
      return {
        ..._0x1461b1,
        keyframe: _0x6ddc8f
      };
    } else {
      return null;
    }
  }
  const _0x3b3e12 = _0x470b53.objectTracks.find(_0x21095f => _0x21095f.objectId === _0x1461b1.objectId);
  const _0x18a718 = _0x3b3e12?.[_0x1461b1.property + "Keyframes"]?.find(_0x44c818 => _0x44c818.id === _0x1461b1.keyframeId);
  if (_0x18a718) {
    return {
      ..._0x1461b1,
      keyframe: _0x18a718
    };
  } else {
    return null;
  }
}
function renderSelectedKeyframeEditor(_0x3e829f, _0x186655, _0x90adba) {
  const _0x3242e6 = findSelectedKeyframe(_0x3e829f, _0x186655);
  if (!_0x3242e6) {
    return "<footer class=\"storyboard-3d-timeline-key-editor is-empty\"><span>选择关键帧后可编辑数值与缓动</span></footer>";
  }
  const {
    keyframe: _0x575fbb
  } = _0x3242e6;
  const _0x4033b3 = _0x90adba?.objects?.find(_0x4667aa => _0x4667aa.id === _0x3242e6.objectId);
  if (_0x3242e6.type === "camera") {
    return "<footer class=\"storyboard-3d-timeline-key-editor\">\n      <strong>摄像机关键帧</strong><span>" + _0x575fbb.time.toFixed(2) + "s · " + formatFrameTime(_0x575fbb.time, _0x3e829f.fps) + "</span>\n      <span>焦距 " + Number(_0x575fbb.camera.focalLength).toFixed(1) + "mm</span>\n      <button type=\"button\" data-storyboard-3d-action=\"timeline-delete-keyframe\">删除关键帧</button>\n    </footer>";
  }
  const _0x3d43b3 = _0x3242e6.property === "rotation";
  return "<footer class=\"storyboard-3d-timeline-key-editor\" data-selected-object-id=\"" + escapeHtml(_0x3242e6.objectId) + "\" data-selected-property=\"" + _0x3242e6.property + "\">\n    <strong>" + escapeHtml(_0x4033b3?.name || _0x3242e6.objectId) + " · " + PROPERTY_LABELS[_0x3242e6.property] + "</strong>\n    <span>" + _0x575fbb.time.toFixed(2) + "s · " + formatFrameTime(_0x575fbb.time, _0x3e829f.fps) + "</span>\n    <div class=\"storyboard-3d-timeline-key-values\">" + ["X", "Y", "Z"].map((_0x1c3909, _0x2cb834) => "<label><span>" + _0x1c3909 + (_0x3d43b3 ? "°" : "") + "</span><input type=\"number\" step=\"" + (_0x3d43b3 ? "1" : "0.01") + "\" value=\"" + (_0x3d43b3 ? Number(_0x575fbb.value[_0x2cb834]) * 180 / Math.PI : Number(_0x575fbb.value[_0x2cb834])).toFixed(_0x3d43b3 ? 1 : 2) + "\" data-storyboard-3d-timeline-key-value=\"" + _0x2cb834 + "\"></label>").join("") + "</div>\n    <label class=\"storyboard-3d-timeline-easing\"><span>缓动</span><select data-storyboard-3d-timeline-key-easing>" + [["linear", "线性"], ["ease-in", "渐入"], ["ease-out", "渐出"], ["ease-in-out", "渐入渐出"]].map(([_0x330291, _0x361ac7]) => "<option value=\"" + _0x330291 + "\" " + (_0x575fbb.easing === _0x330291 ? "selected" : "") + ">" + _0x361ac7 + "</option>").join("") + "</select></label>\n    <button type=\"button\" data-storyboard-3d-action=\"timeline-delete-keyframe\">删除关键帧</button>\n  </footer>";
}
export function renderStoryboard3DShotTimeline({
  scene: _0x1d93cd,
  shot: _0x318010,
  selectedObjectIds = [],
  activeTool = "select",
  currentTime = 0,
  playing = false,
  autoKey = false,
  expandedObjectIds = new Set(),
  activeProperties = new Map(),
  selectedKeyframe = null
} = {}) {
  if (!_0x1d93cd || !_0x318010) {
    return "";
  }
  const _0x349f44 = normalizeAnimation(_0x1d93cd, _0x318010);
  const _0x220b1c = clamp(currentTime, 0, _0x349f44.duration);
  const _0x1098ab = selectedObjectIds.at(-1) || "";
  const _0xa22b1f = (_0x1d93cd.objects || []).filter(_0x51fc88 => _0x51fc88.visible !== false && _0x51fc88.type !== "group" && _0x51fc88.type !== "camera");
  const _0xb9366d = _0xa22b1f.map(_0x29f7cd => renderObjectTrack({
    object: _0x29f7cd,
    animation: _0x349f44,
    activeProperty: activeProperties.get(_0x29f7cd.id) || TOOL_PROPERTIES[activeTool] || "position",
    expanded: expandedObjectIds.has(_0x29f7cd.id),
    selected: _0x29f7cd.id === _0x1098ab,
    selectedKeyframe: selectedKeyframe
  })).join("");
  const _0x34bfe2 = _0x349f44.duration > 0 ? _0x220b1c / _0x349f44.duration * 100 : 0;
  const _0x119fc5 = Math.round(_0x349f44.duration * _0x349f44.fps);
  return "<section class=\"storyboard-3d-shot-timeline " + (playing ? "is-playing" : "") + "\" data-storyboard-3d-shot-timeline data-shot-id=\"" + escapeHtml(_0x318010.id) + "\" style=\"--storyboard-3d-playhead-position:" + _0x34bfe2 + "%\">\n    <header class=\"storyboard-3d-timeline-toolbar\">\n      <div class=\"storyboard-3d-timeline-playback\">\n        <button type=\"button\" data-storyboard-3d-action=\"timeline-go-start\">首帧</button>\n        <button type=\"button\" class=\"storyboard-3d-timeline-play\" data-storyboard-3d-action=\"timeline-toggle-play\">" + (playing ? "暂停" : "播放") + "</button>\n        <button type=\"button\" data-storyboard-3d-action=\"timeline-go-end\">末帧</button>\n      </div>\n      <output data-storyboard-3d-timeline-frame>" + Math.round(_0x220b1c * _0x349f44.fps) + "f</output><span>/ " + _0x119fc5 + "f</span>\n      <label><span>时长</span><input type=\"number\" min=\"0.1\" max=\"3600\" step=\"0.5\" value=\"" + _0x349f44.duration + "\" data-storyboard-3d-timeline-setting=\"duration\"></label>\n      <label><span>FPS</span><select data-storyboard-3d-timeline-setting=\"fps\">" + [12, 24, 25, 30, 50, 60].map(_0x20164e => "<option value=\"" + _0x20164e + "\" " + (_0x349f44.fps === _0x20164e ? "selected" : "") + ">" + _0x20164e + "</option>").join("") + "</select></label>\n      <label class=\"storyboard-3d-timeline-auto-key\"><input type=\"checkbox\" data-storyboard-3d-timeline-auto-key " + (autoKey ? "checked" : "") + "><span>自动 K 帧</span></label>\n      <strong>当前镜头独立时间轴 · " + escapeHtml(_0x318010.name) + "</strong>\n      <small>" + getKeyframeCount(_0x349f44) + " 个关键帧</small>\n    </header>\n    <div class=\"storyboard-3d-timeline-grid\">\n      " + renderRuler(_0x349f44, _0x220b1c) + "\n      " + renderCameraTrack(_0x349f44, selectedKeyframe) + "\n      " + (_0xb9366d || "<div class=\"storyboard-3d-timeline-empty\">选择或添加模型后即可创建变换关键帧</div>") + "\n      <div class=\"storyboard-3d-timeline-playhead\" aria-hidden=\"true\"><span></span></div>\n    </div>\n    " + renderSelectedKeyframeEditor(_0x349f44, selectedKeyframe, _0x1d93cd) + "\n  </section>";
}
export class Storyboard3DShotTimelineController {
  constructor({
    windowObject = globalThis.window,
    getProject: _0x482353,
    getEditorState: _0x52e5fb,
    getRoot: _0x4e299c,
    readCurrentCamera: _0x37457b,
    previewSample: _0x1843f8,
    clearPreview: _0x3aee7e,
    commitMutation: _0x574469,
    requestRender: _0x5d81f7,
    setMessage: _0x90e725
  } = {}) {
    this.window = windowObject;
    this.getProject = _0x482353;
    this.getEditorState = _0x52e5fb;
    this.getRoot = _0x4e299c;
    this.readCurrentCamera = _0x37457b;
    this.previewSample = _0x1843f8;
    this.clearPreview = _0x3aee7e;
    this.commitMutation = _0x574469;
    this.requestRender = _0x5d81f7;
    this.setMessage = _0x90e725;
    this.currentTimes = new Map();
    this.activeProperties = new Map();
    this.expandedObjectIds = new Set();
    this.selectedKeyframe = null;
    this.drawerOpen = false;
    this.autoKey = false;
    this.playing = false;
    this.playbackFrame = null;
    this.playbackStartedAt = 0;
    this.playbackStartTime = 0;
    this.activeShotId = "";
    this.hasPreview = false;
  }
  _context() {
    const _0x481e73 = this.getProject?.();
    const {
      scene: _0x4e78c3,
      shot: _0x4ed50c
    } = getSceneContext(_0x481e73);
    const _0x447152 = this.getEditorState?.() || {};
    return {
      project: _0x481e73,
      scene: _0x4e78c3,
      shot: _0x4ed50c,
      editorState: _0x447152
    };
  }
  _timeForShot(_0x5b66f3) {
    const _0x177a63 = normalizeStoryboard3DShotAnimation(_0x5b66f3?.animation, {
      camera: _0x5b66f3?.camera
    });
    return clamp(this.currentTimes.get(_0x5b66f3?.id) || 0, 0, _0x177a63.duration);
  }
  _setTime(_0x403a73, _0x5c0592) {
    if (!_0x403a73?.id) {
      return 0;
    }
    const _0x42755e = normalizeStoryboard3DShotAnimation(_0x403a73.animation, {
      camera: _0x403a73.camera
    });
    const _0x5940cf = clamp(_0x5c0592, 0, _0x42755e.duration);
    this.currentTimes.set(_0x403a73.id, _0x5940cf);
    return _0x5940cf;
  }
  _syncShot(_0x20447d) {
    const _0x556c65 = _0x20447d?.id || "";
    if (_0x556c65 === this.activeShotId) {
      return;
    }
    this.stopPlayback({
      render: false,
      clear: true
    });
    this.activeShotId = _0x556c65;
    this.selectedKeyframe = null;
    this.hasPreview = false;
  }
  render() {
    const {
      scene: _0xf70996,
      shot: _0x1c4da5,
      editorState: _0x466626
    } = this._context();
    if (!_0xf70996 || !_0x1c4da5) {
      return "";
    }
    this._syncShot(_0x1c4da5);
    return renderStoryboard3DShotTimeline({
      scene: _0xf70996,
      shot: _0x1c4da5,
      selectedObjectIds: _0x466626.selectedObjectIds || [],
      activeTool: _0x466626.activeTool,
      currentTime: this._timeForShot(_0x1c4da5),
      playing: this.playing,
      autoKey: this.autoKey,
      expandedObjectIds: this.expandedObjectIds,
      activeProperties: this.activeProperties,
      selectedKeyframe: this.selectedKeyframe
    });
  }
  _mutateAnimation(_0x538c43, _0x4b3f33, _0x2abc94) {
    this.commitMutation?.({
      type: _0x538c43,
      label: _0x4b3f33,
      mutate: _0x41661e => {
        const {
          scene: _0x1f1407,
          shot: _0x344139
        } = getSceneContext(_0x41661e);
        if (!_0x1f1407 || !_0x344139) {
          return _0x41661e;
        }
        _0x344139.animation = _0x2abc94(normalizeAnimation(_0x1f1407, _0x344139), {
          scene: _0x1f1407,
          shot: _0x344139
        });
        const _0x526a91 = _0x344139.animation.cameraKeyframes[0];
        if (_0x526a91?.camera) {
          _0x344139.camera = cloneCameraState(_0x526a91.camera);
          syncStoryboard3DCameraObjectFromShot(_0x1f1407, _0x344139);
        }
        _0x344139.updatedAt = Date.now();
        return _0x41661e;
      }
    });
  }
  _sampleAt(_0xf86019) {
    const {
      scene: _0x166d4c,
      shot: _0x830d4b
    } = this._context();
    if (!_0x166d4c || !_0x830d4b) {
      return null;
    }
    const _0x1c1f9b = this._setTime(_0x830d4b, _0xf86019);
    const _0x37721a = sampleStoryboard3DShotAnimation(_0x830d4b.animation, _0x1c1f9b, {
      camera: _0x830d4b.camera,
      objectTransforms: createObjectTransforms(_0x166d4c)
    });
    this.hasPreview = true;
    this.previewSample?.(_0x37721a);
    this._syncDisplay(_0x1c1f9b, _0x830d4b);
    return _0x37721a;
  }
  _syncDisplay(_0xcdeb52, _0x350fe6) {
    const _0x43f4bf = this.getRoot?.();
    const _0x5bf783 = _0x43f4bf?.querySelector?.("[data-storyboard-3d-shot-timeline]");
    if (!_0x5bf783 || _0x5bf783.dataset.shotId !== _0x350fe6?.id) {
      return;
    }
    const _0x22ff9b = normalizeStoryboard3DShotAnimation(_0x350fe6.animation, {
      camera: _0x350fe6.camera
    });
    const _0x2eff09 = _0x22ff9b.duration > 0 ? _0xcdeb52 / _0x22ff9b.duration * 100 : 0;
    _0x5bf783.style.setProperty("--storyboard-3d-playhead-position", _0x2eff09 + "%");
    const _0x590d2e = _0x5bf783.querySelector?.("[data-storyboard-3d-timeline-frame]");
    if (_0x590d2e) {
      _0x590d2e.textContent = Math.round(_0xcdeb52 * _0x22ff9b.fps) + "f";
    }
    const _0x59385b = _0x5bf783.querySelector?.("[data-storyboard-3d-timeline-scrubber]");
    if (_0x59385b) {
      _0x59385b.value = String(_0xcdeb52);
    }
  }
  _schedulePlayback() {
    const _0xc2f92c = this.window?.requestAnimationFrame?.bind(this.window) || globalThis.requestAnimationFrame?.bind(globalThis);
    if (!_0xc2f92c || !this.playing) {
      return;
    }
    this.playbackFrame = _0xc2f92c(_0x5f3d16 => {
      if (!this.playing) {
        return;
      }
      const {
        shot: _0x25af08
      } = this._context();
      if (!_0x25af08) {
        return this.stopPlayback();
      }
      const _0x4033f6 = normalizeStoryboard3DShotAnimation(_0x25af08.animation, {
        camera: _0x25af08.camera
      });
      const _0x5ecffa = Math.max(0, (_0x5f3d16 - this.playbackStartedAt) / 1000);
      let _0x5a78dd = this.playbackStartTime + _0x5ecffa;
      if (_0x4033f6.loop && _0x4033f6.duration > 0) {
        _0x5a78dd %= _0x4033f6.duration;
      }
      if (!_0x4033f6.loop && _0x5a78dd >= _0x4033f6.duration) {
        this._sampleAt(_0x4033f6.duration);
        this.stopPlayback({
          clear: false
        });
        return;
      }
      this._sampleAt(_0x5a78dd);
      this._schedulePlayback();
    });
  }
  startPlayback() {
    const {
      shot: _0x4836b1
    } = this._context();
    if (!_0x4836b1) {
      return false;
    }
    const _0x391e2e = normalizeStoryboard3DShotAnimation(_0x4836b1.animation, {
      camera: _0x4836b1.camera
    });
    const _0x10446b = this._timeForShot(_0x4836b1);
    this.playing = true;
    this.playbackStartTime = _0x10446b >= _0x391e2e.duration ? 0 : _0x10446b;
    this.currentTimes.set(_0x4836b1.id, this.playbackStartTime);
    this.playbackStartedAt = this.window?.performance?.now?.() || globalThis.performance?.now?.() || Date.now();
    this.requestRender?.();
    this._sampleAt(this.playbackStartTime);
    this._schedulePlayback();
    return true;
  }
  stopPlayback({
    render = true,
    clear = false
  } = {}) {
    const _0x511974 = this.window?.cancelAnimationFrame?.bind(this.window) || globalThis.cancelAnimationFrame?.bind(globalThis);
    if (this.playbackFrame != null) {
      _0x511974?.(this.playbackFrame);
    }
    const _0x54aff3 = this.playing;
    this.playbackFrame = null;
    this.playing = false;
    if (clear) {
      this.hasPreview = false;
      this.clearPreview?.();
    }
    if (render && _0x54aff3) {
      this.requestRender?.();
    }
  }
  togglePlayback() {
    if (this.playing) {
      this.stopPlayback({
        clear: false
      });
      return true;
    }
    return this.startPlayback();
  }
  _activeProperty(_0x344a58, _0x2869d5) {
    return this.activeProperties.get(_0x344a58) || TOOL_PROPERTIES[_0x2869d5] || "position";
  }
  isDrawerOpen() {
    return this.drawerOpen;
  }
  _syncDrawerPresentation() {
    const _0x4a51a8 = this.getRoot?.();
    const _0x1a023c = _0x4a51a8?.querySelector?.(".storyboard-3d-viewport-column");
    const _0xa1cc29 = _0x4a51a8?.querySelector?.(".storyboard-3d-shot-dock");
    const _0x22ac7b = _0x4a51a8?.querySelector?.(".storyboard-3d-shot-keyframe-trigger");
    const _0x97dc39 = _0x4a51a8?.querySelector?.(".storyboard-3d-timeline-drawer-handle");
    const _0xcc5849 = _0x4a51a8?.querySelector?.(".storyboard-3d-timeline-drawer-content");
    if (!_0x1a023c || !_0xa1cc29 || !_0x22ac7b || !_0x97dc39 || !_0xcc5849) {
      return false;
    }
    const _0x2184cf = this.drawerOpen;
    _0x1a023c.classList.toggle("is-timeline-open", _0x2184cf);
    _0x1a023c.classList.toggle("is-timeline-collapsed", !_0x2184cf);
    _0xa1cc29.classList.toggle("is-timeline-open", _0x2184cf);
    _0xa1cc29.classList.toggle("is-timeline-collapsed", !_0x2184cf);
    _0x22ac7b.classList.toggle("is-active", _0x2184cf);
    _0x22ac7b.setAttribute("aria-expanded", String(_0x2184cf));
    _0x97dc39.classList.toggle("is-open", _0x2184cf);
    _0x97dc39.setAttribute("aria-expanded", String(_0x2184cf));
    const _0x5298a0 = _0x2184cf ? "下拉收起关键帧时间轴" : "上拉展开关键帧时间轴";
    _0x97dc39.setAttribute("aria-label", _0x5298a0);
    _0xcc5849.setAttribute("aria-hidden", String(!_0x2184cf));
    _0xcc5849.inert = !_0x2184cf;
    if (_0x2184cf) {
      _0xcc5849.removeAttribute("inert");
    } else {
      _0xcc5849.setAttribute("inert", "");
    }
    return true;
  }
  setDrawerOpen(_0x1a8406) {
    const _0x2d15e9 = _0x1a8406 === true;
    if (_0x2d15e9 === this.drawerOpen) {
      return false;
    }
    this.drawerOpen = _0x2d15e9;
    if (!_0x2d15e9) {
      this.stopPlayback({
        render: false,
        clear: true
      });
    }
    if (!this._syncDrawerPresentation()) {
      this.requestRender?.();
    }
    return true;
  }
  handleClick(_0x1bf921, _0x402495) {
    if (!String(_0x1bf921 || "").startsWith("timeline-")) {
      return false;
    }
    if (_0x1bf921 === "timeline-toggle-drawer") {
      this.setDrawerOpen(!this.drawerOpen);
      return true;
    }
    const {
      scene: _0xdcd36f,
      shot: _0x1d1f48,
      editorState: _0x5b8de7
    } = this._context();
    if (!_0xdcd36f || !_0x1d1f48) {
      return true;
    }
    if (_0x1bf921 === "timeline-toggle-play") {
      this.togglePlayback();
      return true;
    }
    if (_0x1bf921 === "timeline-go-start" || _0x1bf921 === "timeline-go-end") {
      this.stopPlayback({
        render: false,
        clear: false
      });
      const _0x27ee06 = normalizeAnimation(_0xdcd36f, _0x1d1f48);
      this._sampleAt(_0x1bf921 === "timeline-go-start" ? 0 : _0x27ee06.duration);
      this.requestRender?.();
      return true;
    }
    if (_0x1bf921 === "timeline-toggle-object") {
      const _0x5f4e5c = _0x402495.dataset.objectId;
      if (this.expandedObjectIds.has(_0x5f4e5c)) {
        this.expandedObjectIds.delete(_0x5f4e5c);
      } else {
        this.expandedObjectIds.add(_0x5f4e5c);
      }
      this.requestRender?.();
      return true;
    }
    if (_0x1bf921 === "timeline-set-object-property") {
      const _0x3607b4 = _0x402495.dataset.objectId;
      const _0x151c3b = _0x402495.dataset.property;
      if (STORYBOARD_3D_OBJECT_ANIMATION_PROPERTIES.includes(_0x151c3b)) {
        this.activeProperties.set(_0x3607b4, _0x151c3b);
        this.requestRender?.();
      }
      return true;
    }
    if (_0x1bf921 === "timeline-add-camera-keyframe") {
      const _0x59bdc1 = this.readCurrentCamera?.();
      if (!_0x59bdc1) {
        this.setMessage?.("当前摄像机状态不可用。");
        return true;
      }
      const _0x5c03f5 = this._timeForShot(_0x1d1f48);
      this._mutateAnimation("add-camera-keyframe", "Add camera keyframe", _0x1732f8 => upsertStoryboard3DCameraKeyframe(_0x1732f8, {
        time: _0x5c03f5,
        camera: _0x59bdc1
      }));
      this.setMessage?.("已在 " + formatFrameTime(_0x5c03f5, normalizeAnimation(_0xdcd36f, _0x1d1f48).fps) + " 添加摄像机关键帧。");
      return true;
    }
    if (_0x1bf921 === "timeline-add-object-keyframe") {
      const _0x58df33 = _0x402495.dataset.objectId || _0x5b8de7.selectedObjectIds?.at(-1);
      const _0x4e5e61 = _0x402495.dataset.property || this._activeProperty(_0x58df33, _0x5b8de7.activeTool);
      const _0x1b7585 = _0xdcd36f.objects.find(_0x185560 => _0x185560.id === _0x58df33);
      if (!_0x1b7585 || !STORYBOARD_3D_OBJECT_ANIMATION_PROPERTIES.includes(_0x4e5e61)) {
        return true;
      }
      const _0x564359 = this._timeForShot(_0x1d1f48);
      this._mutateAnimation("add-object-keyframe", "Add object keyframe", _0x500b21 => upsertStoryboard3DObjectKeyframe(_0x500b21, {
        objectId: _0x58df33,
        property: _0x4e5e61,
        time: _0x564359,
        transform: _0x1b7585.transform
      }));
      this.setMessage?.("已为“" + _0x1b7585.name + "”的" + PROPERTY_LABELS[_0x4e5e61] + "添加关键帧。");
      return true;
    }
    if (_0x1bf921 === "timeline-select-keyframe") {
      this.stopPlayback({
        render: false,
        clear: false
      });
      this.selectedKeyframe = {
        shotId: _0x1d1f48.id,
        type: _0x402495.dataset.keyframeType,
        objectId: _0x402495.dataset.objectId || "",
        property: _0x402495.dataset.property || "",
        keyframeId: _0x402495.dataset.keyframeId
      };
      this._sampleAt(Number(_0x402495.dataset.keyframeTime) || 0);
      this.requestRender?.();
      return true;
    }
    if (_0x1bf921 === "timeline-delete-keyframe") {
      if (!this.selectedKeyframe) {
        return true;
      }
      const _0x47f883 = {
        ...this.selectedKeyframe
      };
      this._mutateAnimation("delete-animation-keyframe", "Delete animation keyframe", _0x22472d => removeStoryboard3DAnimationKeyframe(_0x22472d, _0x47f883));
      this.selectedKeyframe = null;
      return true;
    }
    return true;
  }
  handleInput(_0x5acbed) {
    if (_0x5acbed.target?.matches?.("[data-storyboard-3d-timeline-scrubber]")) {
      this.stopPlayback({
        render: false,
        clear: false
      });
      this._sampleAt(Number(_0x5acbed.target.value) || 0);
      return true;
    }
    return false;
  }
  handleChange(_0x419525) {
    const {
      scene: _0x3b607f,
      shot: _0x3f0b0a
    } = this._context();
    if (!_0x3b607f || !_0x3f0b0a) {
      return false;
    }
    if (_0x419525.target?.matches?.("[data-storyboard-3d-timeline-auto-key]")) {
      this.autoKey = _0x419525.target.checked === true;
      this.requestRender?.();
      return true;
    }
    if (_0x419525.target?.matches?.("[data-storyboard-3d-timeline-setting]")) {
      const _0x50f917 = _0x419525.target.dataset.storyboard3dTimelineSetting;
      const _0x281956 = Number(_0x419525.target.value);
      this._mutateAnimation("update-animation-settings", "Update animation settings", _0x1c2e4d => updateStoryboard3DShotAnimationSettings(_0x1c2e4d, {
        [_0x50f917]: _0x281956
      }));
      return true;
    }
    if (_0x419525.target?.matches?.("[data-storyboard-3d-timeline-key-value]")) {
      const _0x408201 = this.selectedKeyframe;
      if (!_0x408201 || _0x408201.type !== "object") {
        return true;
      }
      const _0x1c65f6 = Number(_0x419525.target.dataset.storyboard3dTimelineKeyValue);
      const _0x982c96 = Number(_0x419525.target.value);
      const _0x4bb052 = _0x408201.property === "rotation" ? _0x982c96 * Math.PI / 180 : _0x982c96;
      this._mutateAnimation("update-animation-keyframe", "Update animation keyframe", _0xf9fc78 => {
        const _0x11554d = _0xf9fc78.objectTracks.find(_0x2ffbc8 => _0x2ffbc8.objectId === _0x408201.objectId);
        const _0x2fd569 = _0x11554d?.[_0x408201.property + "Keyframes"]?.find(_0x5a8c92 => _0x5a8c92.id === _0x408201.keyframeId);
        if (_0x2fd569 && _0x1c65f6 >= 0 && _0x1c65f6 < 3 && Number.isFinite(_0x4bb052)) {
          _0x2fd569.value[_0x1c65f6] = _0x4bb052;
        }
        return normalizeStoryboard3DShotAnimation(_0xf9fc78);
      });
      return true;
    }
    if (_0x419525.target?.matches?.("[data-storyboard-3d-timeline-key-easing]")) {
      const _0x333b5a = this.selectedKeyframe;
      if (!_0x333b5a || _0x333b5a.type !== "object") {
        return true;
      }
      const _0x41a67a = String(_0x419525.target.value || "ease-in-out");
      this._mutateAnimation("update-animation-easing", "Update animation easing", _0xdf7930 => {
        const _0x508133 = _0xdf7930.objectTracks.find(_0x17a989 => _0x17a989.objectId === _0x333b5a.objectId);
        const _0x5874dd = _0x508133?.[_0x333b5a.property + "Keyframes"]?.find(_0x2fa8df => _0x2fa8df.id === _0x333b5a.keyframeId);
        if (_0x5874dd) {
          _0x5874dd.easing = _0x41a67a;
        }
        return normalizeStoryboard3DShotAnimation(_0xdf7930);
      });
      return true;
    }
    return false;
  }
  isAutoKeyEnabled() {
    return this.autoKey;
  }
  recordCameraKeyframe(_0x1a044c) {
    if (!this.autoKey || !_0x1a044c) {
      return false;
    }
    const {
      shot: _0x1d85c5
    } = this._context();
    if (!_0x1d85c5) {
      return false;
    }
    const _0x583eb3 = this._timeForShot(_0x1d85c5);
    this._mutateAnimation("auto-key-camera", "Auto key camera", _0x4f8f02 => upsertStoryboard3DCameraKeyframe(_0x4f8f02, {
      time: _0x583eb3,
      camera: _0x1a044c
    }));
    return true;
  }
  recordObjectTransforms(_0x5cf95d, _0x3246ed) {
    if (!this.autoKey) {
      return false;
    }
    const {
      scene: _0x237389,
      shot: _0x5d3c34
    } = this._context();
    if (!_0x237389 || !_0x5d3c34) {
      return false;
    }
    const _0x192b1e = TOOL_PROPERTIES[_0x3246ed] || "position";
    const _0x285c10 = this._timeForShot(_0x5d3c34);
    this._mutateAnimation("auto-key-objects", "Auto key objects", _0x5742f8 => {
      let _0x392e93 = _0x5742f8;
      Object.entries(_0x5cf95d || {}).forEach(([_0x2a5fd1, _0x3082ba]) => {
        _0x392e93 = upsertStoryboard3DObjectKeyframe(_0x392e93, {
          objectId: _0x2a5fd1,
          property: _0x192b1e,
          time: _0x285c10,
          transform: _0x3082ba
        });
      });
      return _0x392e93;
    });
    return true;
  }
  getPreviewTransform(_0x5be621) {
    if (!this.hasPreview) {
      return null;
    }
    const {
      scene: _0x4acfb0,
      shot: _0x540b61
    } = this._context();
    if (!_0x4acfb0 || !_0x540b61) {
      return null;
    }
    return sampleStoryboard3DShotAnimation(_0x540b61.animation, this._timeForShot(_0x540b61), {
      camera: _0x540b61.camera,
      objectTransforms: createObjectTransforms(_0x4acfb0)
    }).objectTransforms[_0x5be621] || null;
  }
  syncPreview() {
    if (!this.hasPreview || this.playing) {
      return;
    }
    const {
      shot: _0x2ab7c5
    } = this._context();
    if (_0x2ab7c5) {
      this._sampleAt(this._timeForShot(_0x2ab7c5));
    }
  }
  destroy() {
    this.stopPlayback({
      render: false,
      clear: true
    });
    this.currentTimes.clear();
    this.activeProperties.clear();
    this.expandedObjectIds.clear();
    this.selectedKeyframe = null;
    this.drawerOpen = false;
  }
}
export function createStoryboard3DShotTimelineController(_0x25f0b4) {
  return new Storyboard3DShotTimelineController(_0x25f0b4);
}