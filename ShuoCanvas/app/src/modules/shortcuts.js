import { fetchUserShortcutsFromServer, saveUserShortcutsToServer } from "../../api/shortcutsApi.js";
import { onLocaleChange, t } from "../i18n/index.js";
import { desktopBridge } from "../services/desktopBridge.js";
const DEFAULT_PRESET_NAME = "默认预设";
const ASHUO_PRESET_NAME = "阿硕预设";
const CUSTOM_PRESET_NAME = "用户自定义";
const SHORTCUT_GROUP_I18N_KEYS = Object.freeze({
  通用: "general",
  编辑与选择: "editSelection",
  设置开关: "settingToggles",
  创建节点: "createNodes",
  侧边栏: "sidebar",
  画笔功能: "brushTools",
  图像功能: "imageTools",
  视频功能: "videoTools",
  音频功能: "audioTools",
  剪辑功能: "clipTools",
  文本功能: "textTools",
  "3D导演台": "panoramaStage"
});
function _formatI18nMessage(_0x476159, _0x3271b5 = {}) {
  let _0x245d13 = String(_0x476159 || "");
  Object.entries(_0x3271b5 || {}).forEach(([_0x4a705b, _0x46656e]) => {
    _0x245d13 = _0x245d13.split("{" + _0x4a705b + "}").join(String(_0x46656e ?? ""));
  });
  return _0x245d13;
}
function _tShortcut(_0x11b656, _0x1ef1be, _0x4096b8 = {}) {
  const _0x50b147 = "settings.shortcuts." + _0x11b656;
  const _0x513ba4 = t(_0x50b147);
  return _formatI18nMessage(_0x513ba4 === _0x50b147 ? _0x1ef1be : _0x513ba4, _0x4096b8);
}
function _translateShortcutGroup(_0x333e93) {
  const _0x1049db = SHORTCUT_GROUP_I18N_KEYS[_0x333e93];
  if (_0x1049db) {
    return _tShortcut("groups." + _0x1049db, _0x333e93);
  } else {
    return _0x333e93;
  }
}
function _translateShortcutAction(_0x2f7b5f, _0x29564f) {
  return _tShortcut("actions." + _0x2f7b5f, _0x29564f || _0x2f7b5f);
}
export const DEFAULT_SHORTCUTS = {
  "zoom-in": {
    label: "放大",
    keys: ["Ctrl", "+"],
    group: "通用"
  },
  "zoom-out": {
    label: "缩小",
    keys: ["Ctrl", "-"],
    group: "通用"
  },
  "fit-all": {
    label: "聚焦节点/适应画布",
    keys: [],
    group: "通用"
  },
  minimap: {
    label: "小地图",
    keys: ["M"],
    group: "通用"
  },
  "pan-canvas": {
    label: "拖动画布（按住）",
    keys: ["Space"],
    group: "通用"
  },
  copy: {
    label: "复制节点",
    keys: ["Ctrl", "C"],
    group: "编辑与选择"
  },
  "copy-media": {
    label: "复制图像",
    keys: ["Ctrl", "Shift", "C"],
    group: "编辑与选择"
  },
  cut: {
    label: "剪切节点",
    keys: ["Ctrl", "X"],
    group: "编辑与选择"
  },
  "canvas-screenshot": {
    label: "画布截图",
    keys: ["Alt", "Q"],
    group: "编辑与选择"
  },
  "duplicate-with-edges": {
    label: "拖拽创建连线副本",
    keys: ["Alt"],
    group: "编辑与选择"
  },
  paste: {
    label: "粘贴节点",
    keys: ["Ctrl", "V"],
    group: "编辑与选择"
  },
  undo: {
    label: "撤销",
    keys: ["Ctrl", "Z"],
    group: "编辑与选择"
  },
  redo: {
    label: "重做",
    keys: ["Ctrl", "Y"],
    group: "编辑与选择"
  },
  delete: {
    label: "删除节点",
    keys: ["Delete"],
    alternateKeys: [["Delete"], ["Backspace"]],
    group: "编辑与选择"
  },
  "select-all": {
    label: "全选",
    keys: ["Ctrl", "A"],
    group: "编辑与选择"
  },
  "multi-select": {
    label: "多选节点（配合点击）",
    keys: ["Shift"],
    group: "编辑与选择"
  },
  group: {
    label: "编组",
    keys: ["Ctrl", "G"],
    group: "编辑与选择"
  },
  "align-feature": {
    label: "多选对齐功能",
    keys: ["Tab"],
    group: "通用"
  },
  "grid-dots": {
    label: "显示网格点",
    keys: ["G"],
    group: "设置开关"
  },
  "toggle-connection-lines": {
    label: "显示/隐藏连接线",
    keys: ["B"],
    group: "设置开关"
  },
  "toggle-selection-related-highlight": {
    label: "点击节点时高亮关联节点",
    keys: [],
    group: "设置开关"
  },
  "snap-guides": {
    label: "辅助线吸附",
    keys: ["Shift", ";"],
    group: "设置开关"
  },
  "snap-grid": {
    label: "网格吸附开关",
    keys: ["Shift", "G"],
    group: "设置开关"
  },
  "toggle-title-follows-zoom": {
    label: "标题跟随画布缩放",
    keys: [],
    group: "设置开关"
  },
  "toggle-media-node-resize": {
    label: "图像视频节点缩放",
    keys: [],
    group: "设置开关"
  },
  "toggle-prompt-box-resize": {
    label: "允许提示词栏下拉",
    keys: [],
    group: "设置开关"
  },
  "toggle-node-avoid-overlap": {
    label: "新节点自动避让",
    keys: [],
    group: "设置开关"
  },
  "reset-media-size": {
    label: "恢复节点默认大小",
    keys: ["Shift", "R"],
    group: "编辑与选择"
  },
  "add-reference": {
    label: "添加参考",
    keys: ["X"],
    group: "编辑与选择"
  },
  "toggle-agent": {
    label: "打开/关闭 SHUO Agent",
    keys: ["T"],
    group: "侧边栏"
  },
  "create-text": {
    label: "创建源文本节点",
    keys: [],
    group: "创建节点"
  },
  "create-comment-note": {
    label: "创建注释节点",
    keys: ["N"],
    group: "创建节点"
  },
  "create-ai-text": {
    label: "创建生成文本节点",
    keys: ["Q"],
    group: "创建节点"
  },
  "create-ai-image": {
    label: "创建生成图像节点",
    keys: ["W"],
    group: "创建节点"
  },
  "create-ai-video": {
    label: "创建生成视频节点",
    keys: ["E"],
    group: "创建节点"
  },
  "create-ai-audio": {
    label: "创建生成音频节点",
    keys: ["R"],
    group: "创建节点"
  },
  "upload-file": {
    label: "上传文件",
    keys: [],
    group: "创建节点"
  },
  "cut-edge": {
    label: "剪刀（切断连线）",
    keys: ["Ctrl"],
    group: "编辑与选择"
  },
  save: {
    label: "保存画布",
    keys: ["Ctrl", "S"],
    group: "通用"
  },
  "open-settings": {
    label: "打开设置",
    keys: ["Ctrl", ","],
    group: "通用"
  },
  "open-canvas-projects": {
    label: "打开画布项目",
    keys: [],
    group: "侧边栏"
  },
  "open-assets": {
    label: "打开素材",
    keys: [],
    group: "侧边栏"
  },
  "open-workflows": {
    label: "打开工作流",
    keys: [],
    group: "侧边栏"
  },
  "open-node-manager": {
    label: "打开/关闭节点管理",
    keys: [],
    group: "侧边栏"
  },
  "open-files": {
    label: "打开文件管理",
    keys: [],
    group: "侧边栏"
  },
  "open-task-center": {
    label: "打开任务进程",
    keys: [],
    group: "侧边栏"
  },
  "open-custom-ai-app": {
    label: "打开自定义AI应用",
    keys: [],
    group: "侧边栏"
  },
  "escape-all": {
    label: "取消/关闭所有菜单弹窗",
    keys: ["Escape"],
    group: "通用",
    hidden: true
  },
  "editor-tool-brush": {
    label: "画笔（切换模式）",
    keys: ["B"],
    group: "画笔功能"
  },
  "editor-tool-rect": {
    label: "矩形",
    keys: [],
    group: "画笔功能"
  },
  "editor-tool-eraser": {
    label: "橡皮擦",
    keys: ["E"],
    group: "画笔功能"
  },
  "editor-tool-bucket": {
    label: "油漆桶",
    keys: ["G"],
    group: "画笔功能"
  },
  "editor-clear": {
    label: "清空",
    keys: ["R"],
    group: "画笔功能"
  },
  "image-tool-matting": {
    label: "遮罩编辑器",
    keys: ["1"],
    group: "图像功能"
  },
  "image-tool-repaint": {
    label: "重绘",
    keys: ["2"],
    group: "图像功能"
  },
  "image-tool-erase": {
    label: "擦除",
    keys: ["3"],
    group: "图像功能"
  },
  "image-tool-hd": {
    label: "高清",
    keys: ["4"],
    group: "图像功能"
  },
  "image-tool-expand": {
    label: "扩图",
    keys: ["5"],
    group: "图像功能"
  },
  "image-tool-auto-subject": {
    label: "自动识别主体",
    keys: ["6"],
    group: "图像功能"
  },
  "image-tool-multigrid": {
    label: "宫格裁剪",
    keys: ["7"],
    group: "图像功能"
  },
  "image-tool-multiangle": {
    label: "控制角度",
    keys: ["8"],
    group: "图像功能"
  },
  "image-tool-annotate": {
    label: "标注",
    keys: ["9"],
    group: "图像功能"
  },
  "image-tool-crop": {
    label: "裁剪",
    keys: ["0"],
    group: "图像功能"
  },
  "image-tool-fullscreen": {
    label: "全屏显示",
    keys: ["-"],
    group: "图像功能"
  },
  "image-tool-download": {
    label: "下载",
    keys: ["="],
    group: "图像功能"
  },
  "video-tool-clip": {
    label: "裁剪视频",
    keys: ["1"],
    group: "视频功能"
  },
  "video-tool-separate-av": {
    label: "音画分离",
    keys: ["6"],
    group: "视频功能"
  },
  "video-tool-capture-frame": {
    label: "截取当前帧",
    keys: ["C"],
    group: "视频功能"
  },
  "video-tool-keying": {
    label: "抠像",
    keys: ["2"],
    group: "视频功能"
  },
  "video-tool-hd": {
    label: "高清",
    keys: ["3"],
    group: "视频功能"
  },
  "video-tool-fullscreen": {
    label: "全屏显示",
    keys: ["4"],
    group: "视频功能"
  },
  "video-tool-download": {
    label: "下载",
    keys: ["5"],
    group: "视频功能"
  },
  "ms-sync-video-play": {
    label: "同步播放视频",
    keys: [],
    group: "视频功能"
  },
  "audio-tool-clip": {
    label: "裁剪音频",
    keys: ["1"],
    group: "音频功能"
  },
  "audio-tool-speed": {
    label: "倍速",
    keys: ["2"],
    group: "音频功能"
  },
  "audio-tool-download": {
    label: "下载",
    keys: ["3"],
    group: "音频功能"
  },
  "clip-tool-crop": {
    label: "剪辑裁剪",
    keys: ["C"],
    group: "剪辑功能"
  },
  "text-tool-copy": {
    label: "复制",
    keys: ["1"],
    group: "文本功能"
  },
  "text-tool-fullscreen": {
    label: "全屏显示",
    keys: ["2"],
    group: "文本功能"
  },
  "panorama-scene-tool-toggle-mouse": {
    label: "鼠标",
    keys: ["V"],
    group: "3D导演台"
  },
  "panorama-scene-tool-move": {
    label: "移动",
    keys: ["W"],
    group: "3D导演台"
  },
  "panorama-scene-tool-scale": {
    label: "缩放",
    keys: ["E"],
    group: "3D导演台"
  },
  "panorama-scene-tool-rotate": {
    label: "旋转",
    keys: ["R"],
    group: "3D导演台"
  },
  "panorama-scene-reset-view": {
    label: "重置视角",
    keys: [],
    group: "3D导演台"
  },
  "panorama-scene-capture": {
    label: "截图",
    keys: ["C"],
    group: "3D导演台"
  },
  "panorama-scene-camera-create": {
    label: "创建机位书签",
    keys: ["`"],
    group: "3D导演台"
  },
  "panorama-scene-camera-1": {
    label: "跳转机位书签 1",
    keys: ["1"],
    group: "3D导演台"
  },
  "panorama-scene-camera-2": {
    label: "跳转机位书签 2",
    keys: ["2"],
    group: "3D导演台"
  },
  "panorama-scene-camera-3": {
    label: "跳转机位书签 3",
    keys: ["3"],
    group: "3D导演台"
  },
  "panorama-scene-camera-4": {
    label: "跳转机位书签 4",
    keys: ["4"],
    group: "3D导演台"
  },
  "panorama-scene-camera-5": {
    label: "跳转机位书签 5",
    keys: ["5"],
    group: "3D导演台"
  },
  "panorama-scene-camera-6": {
    label: "跳转机位书签 6",
    keys: ["6"],
    group: "3D导演台"
  },
  "panorama-scene-camera-7": {
    label: "跳转机位书签 7",
    keys: ["7"],
    group: "3D导演台"
  },
  "panorama-scene-camera-8": {
    label: "跳转机位书签 8",
    keys: ["8"],
    group: "3D导演台"
  },
  "panorama-scene-camera-9": {
    label: "跳转机位书签 9",
    keys: ["9"],
    group: "3D导演台"
  },
  "panorama-scene-camera-0": {
    label: "跳转机位书签 10",
    keys: [],
    group: "3D导演台"
  },
  "panorama-scene-camera-save-1": {
    label: "保存当前视图到机位书签 1",
    keys: ["Ctrl", "1"],
    group: "3D导演台"
  },
  "panorama-scene-camera-save-2": {
    label: "保存当前视图到机位书签 2",
    keys: ["Ctrl", "2"],
    group: "3D导演台"
  },
  "panorama-scene-camera-save-3": {
    label: "保存当前视图到机位书签 3",
    keys: ["Ctrl", "3"],
    group: "3D导演台"
  },
  "panorama-scene-camera-save-4": {
    label: "保存当前视图到机位书签 4",
    keys: ["Ctrl", "4"],
    group: "3D导演台"
  },
  "panorama-scene-camera-save-5": {
    label: "保存当前视图到机位书签 5",
    keys: ["Ctrl", "5"],
    group: "3D导演台"
  },
  "panorama-scene-camera-save-6": {
    label: "保存当前视图到机位书签 6",
    keys: ["Ctrl", "6"],
    group: "3D导演台"
  },
  "panorama-scene-camera-save-7": {
    label: "保存当前视图到机位书签 7",
    keys: ["Ctrl", "7"],
    group: "3D导演台"
  },
  "panorama-scene-camera-save-8": {
    label: "保存当前视图到机位书签 8",
    keys: ["Ctrl", "8"],
    group: "3D导演台"
  },
  "panorama-scene-camera-save-9": {
    label: "保存当前视图到机位书签 9",
    keys: ["Ctrl", "9"],
    group: "3D导演台"
  },
  "panorama-scene-camera-save-0": {
    label: "保存当前视图到机位书签 10",
    keys: [],
    group: "3D导演台"
  }
};
export const PRESETS = {
  [DEFAULT_PRESET_NAME]: {},
  [ASHUO_PRESET_NAME]: {
    "fit-all": ["F"],
    redo: ["Ctrl", "Shift", "Z"],
    delete: ["D"],
    "snap-guides": [";"],
    "snap-grid": ["L"],
    "grid-dots": ["."],
    "ms-sync-video-play": ["G"],
    "create-text": [],
    "open-settings": ["K"],
    "open-assets": ["A"],
    "open-files": ["Z"]
  }
};
const BUILTIN_PRESET_NAMES = new Set(Object.keys(PRESETS));
const MODIFIER_ONLY_SHORTCUT_ACTIONS = new Set(["cut-edge", "duplicate-with-edges", "multi-select"]);
const FIXED_GLOBAL_SHORTCUT_BINDINGS = Object.freeze({
  delete: Object.freeze([Object.freeze(["Delete"])])
});
let _shortcuts = {};
let _currentPreset = ASHUO_PRESET_NAME;
let _recordingAction = null;
let _shortcutSearchQuery = "";
let _saveRevision = 0;
let _saveLoopPromise = null;
function _setRecordingAction(_0xee19fd) {
  _recordingAction = _0xee19fd || null;
  if (typeof window !== "undefined") {
    window.__aicShortcutRecording = !!_recordingAction;
  }
}
const DEFAULT_SHORTCUT_MIGRATIONS = {
  "panorama-scene-tool-move": {
    from: ["Q"],
    to: ["W"]
  },
  "panorama-scene-tool-scale": {
    from: ["W"],
    to: ["E"]
  },
  "panorama-scene-tool-rotate": {
    from: ["E"],
    to: ["R"]
  },
  "panorama-scene-reset-view": {
    from: ["R"],
    to: []
  }
};
const DEFAULT_PRESET_SHORTCUT_MIGRATIONS = {
  "fit-all": {
    from: ["Ctrl", "0"],
    to: []
  }
};
const ASHUO_PRESET_SHORTCUT_MIGRATIONS = {
  redo: {
    from: ["Ctrl", "Y"],
    to: ["Ctrl", "Shift", "Z"]
  },
  "open-assets": {
    from: [],
    to: ["A"]
  },
  "open-files": {
    from: [],
    to: ["Z"]
  }
};
const BUILTIN_PRESET_SHORTCUT_MIGRATIONS = {
  "add-reference": {
    from: [],
    to: ["X"]
  },
  "create-text": {
    from: ["T"],
    to: []
  }
};
function _emitShortcutsUpdated() {
  window.dispatchEvent(new CustomEvent("shortcuts-updated"));
}
const _TOOLBAR_SHORTCUT_PREFIX_BY_NODE_TYPE = {
  "source-image": "image-tool-",
  "ai-image": "image-tool-",
  image: "image-tool-",
  "source-video": "video-tool-",
  "ai-video": "video-tool-",
  video: "video-tool-",
  "source-audio": "audio-tool-",
  "ai-audio": "audio-tool-",
  audio: "audio-tool-",
  "media-clip": "clip-tool-",
  "source-text": "text-tool-",
  "ai-text": "text-tool-",
  text: "text-tool-"
};
const _PANORAMA_SCENE_NODE_TYPES = new Set(["panorama-scene", "panorama-360"]);
function _isPanoramaSceneShortcut(_0x12593a) {
  const _0x1fb98e = String(_0x12593a || "").trim();
  return _0x1fb98e.startsWith("panorama-scene-tool-") || _0x1fb98e.startsWith("panorama-scene-camera-") || _0x1fb98e.startsWith("panorama-scene-camera-save-") || _0x1fb98e === "panorama-scene-camera-create" || _0x1fb98e === "panorama-scene-reset-view" || _0x1fb98e === "panorama-scene-capture";
}
function _isNodeToolbarAction(_0x5314f4) {
  return /^(image|video|audio|clip|text)-tool-/.test(String(_0x5314f4 || ""));
}
function _isEditorShortcut(_0x35654b) {
  return String(_0x35654b || "").trim().startsWith("editor-");
}
function _isCreateNodeShortcut(_0x350917) {
  return String(_0x350917 || "").trim().startsWith("create-");
}
function _isGlobalShortcut(_0x2b89de) {
  const _0x2dceba = String(_0x2b89de || "").trim();
  if (!_0x2dceba) {
    return false;
  }
  return !_isEditorShortcut(_0x2dceba) && !_isNodeToolbarAction(_0x2dceba) && !_isPanoramaSceneShortcut(_0x2dceba) && !_isCreateNodeShortcut(_0x2dceba);
}
function _isPanoramaSceneNodeType(_0x3f49f7) {
  return _PANORAMA_SCENE_NODE_TYPES.has(String(_0x3f49f7 || "").trim());
}
function _isPanoramaSceneEditingContext(_0x3c76bc) {
  return _isPanoramaSceneNodeType(_0x3c76bc?.selectedNodeType) && _0x3c76bc?.panoramaSceneEditing === true;
}
function _filterShortcutMatchesByContext(_0x8e6908, _0x517f37 = {}) {
  let _0x356a15 = Array.isArray(_0x8e6908) ? [..._0x8e6908] : [];
  if (!(Number(_0x517f37.selectedSyncPlayableVideoCount) >= 2)) {
    _0x356a15 = _0x356a15.filter(_0x50c5e5 => _0x50c5e5 !== "ms-sync-video-play");
  }
  if (_0x517f37.featureModeActive) {
    _0x356a15 = _0x356a15.filter(_0x59d5c6 => !_isNodeToolbarAction(_0x59d5c6));
  }
  if (_0x517f37.alignFeatureEnabled === false) {
    _0x356a15 = _0x356a15.filter(_0x465c81 => _0x465c81 !== "align-feature");
  }
  if (_0x517f37.mediaClipExpandedEditing === true) {
    _0x356a15 = _0x356a15.filter(_0xcd39bc => _0xcd39bc !== "pan-canvas");
  }
  if (_isPanoramaSceneEditingContext(_0x517f37)) {
    _0x356a15 = _0x356a15.filter(_0x5716d5 => !_isNodeToolbarAction(_0x5716d5) && !_isCreateNodeShortcut(_0x5716d5));
  }
  return _0x356a15;
}
function _resolveToolbarShortcutMatch(_0x3fe3d6, _0x568925) {
  const _0x2f8795 = _TOOLBAR_SHORTCUT_PREFIX_BY_NODE_TYPE[String(_0x568925 || "").trim()];
  if (!_0x2f8795) {
    return null;
  }
  return _0x3fe3d6.find(_0x2dd806 => _0x2dd806.startsWith(_0x2f8795)) || null;
}
function _resolveShortcutMatch(_0x5981aa, _0x43a8d4 = {}) {
  if (!Array.isArray(_0x5981aa) || _0x5981aa.length === 0) {
    return null;
  }
  if (_0x43a8d4.mattingActive || _0x43a8d4.annotateActive || _0x43a8d4.videoKeyingActive) {
    const _0x4874f0 = _0x5981aa.find(_0x4a071a => _isEditorShortcut(_0x4a071a));
    if (_0x4874f0) {
      return _0x4874f0;
    }
  }
  if (_isPanoramaSceneEditingContext(_0x43a8d4)) {
    const _0x31913e = _0x5981aa.find(_0x43fd19 => _isPanoramaSceneShortcut(_0x43fd19));
    if (_0x31913e) {
      return _0x31913e;
    }
  }
  const _0x324758 = _resolveToolbarShortcutMatch(_0x5981aa, _0x43a8d4.selectedNodeType);
  if (_0x324758) {
    return _0x324758;
  }
  const _0xfec550 = _0x5981aa.find(_0x3fe16b => _isGlobalShortcut(_0x3fe16b));
  if (_0xfec550) {
    return _0xfec550;
  }
  const _0x5c4fb5 = _0x5981aa.find(_0x4a66c2 => _isCreateNodeShortcut(_0x4a66c2));
  if (_0x5c4fb5) {
    return _0x5c4fb5;
  }
  return null;
}
function _getShortcutBindingStrings(_0x4531a1, _0x160907) {
  const _0x282fae = [];
  if (Array.isArray(_0x160907?.keys) && _0x160907.keys.length > 0) {
    _0x282fae.push(_0x160907.keys);
  }
  if (Array.isArray(_0x160907?.alternateKeys)) {
    _0x160907.alternateKeys.forEach(_0x1160f2 => {
      if (Array.isArray(_0x1160f2) && _0x1160f2.length > 0) {
        _0x282fae.push(_0x1160f2);
      }
    });
  }
  const _0x2b66a4 = FIXED_GLOBAL_SHORTCUT_BINDINGS[_0x4531a1] || [];
  _0x2b66a4.forEach(_0x40cb6a => _0x282fae.push(_0x40cb6a));
  return _0x282fae.map(_0x38773d => _toShortcutBindingString(_0x38773d));
}
function _normalizeShortcutToken(_0x4d1d53) {
  const _0x572503 = String(_0x4d1d53 || "").trim();
  if (!_0x572503) {
    return "";
  }
  const _0x3e24d2 = _0x572503.toLowerCase();
  if (_0x3e24d2 === "ctrl" || _0x3e24d2 === "control" || _0x3e24d2 === "meta") {
    return "Ctrl";
  }
  if (_0x3e24d2 === "shift") {
    return "Shift";
  }
  if (_0x3e24d2 === "alt") {
    return "Alt";
  }
  if (_0x3e24d2 === "space") {
    return "Space";
  }
  if (_0x3e24d2 === "backquote" || _0x572503 === "`" || _0x572503 === "~") {
    return "`";
  }
  if (_0x572503.length === 1) {
    return _0x572503.toUpperCase();
  }
  return _0x572503;
}
function _normalizeShortcutMainKey(_0x5c2821) {
  const _0x56450d = String(_0x5c2821?.code || "").trim();
  const _0x2abb84 = String(_0x5c2821?.key || "").trim();
  if (_0x56450d === "Backquote") {
    return "`";
  }
  if (_0x56450d === "Space") {
    return "Space";
  }
  if (_0x56450d === "Delete" || _0x2abb84 === "Del") {
    return "Delete";
  }
  if (_0x56450d === "Backspace") {
    return "Backspace";
  }
  return _normalizeShortcutToken(_0x5c2821?.key === " " ? "Space" : _0x5c2821?.key);
}
function _normalizeShortcutKeys(_0x2e4eef) {
  if (!Array.isArray(_0x2e4eef)) {
    return [];
  }
  const _0x37eab8 = _0x2e4eef.map(_0x1e6709 => _normalizeShortcutToken(_0x1e6709)).filter(Boolean);
  const _0x4f0af3 = [];
  if (_0x37eab8.includes("Ctrl")) {
    _0x4f0af3.push("Ctrl");
  }
  if (_0x37eab8.includes("Shift")) {
    _0x4f0af3.push("Shift");
  }
  if (_0x37eab8.includes("Alt")) {
    _0x4f0af3.push("Alt");
  }
  const _0x2d3e11 = _0x37eab8.filter(_0x3df7cc => _0x3df7cc !== "Ctrl" && _0x3df7cc !== "Shift" && _0x3df7cc !== "Alt");
  return [..._0x4f0af3, ..._0x2d3e11];
}
function _buildShortcutKeysFromEvent(_0xf2e36) {
  const _0x4d790a = [];
  if (_0xf2e36.ctrlKey || _0xf2e36.metaKey) {
    _0x4d790a.push("Ctrl");
  }
  if (_0xf2e36.shiftKey) {
    _0x4d790a.push("Shift");
  }
  if (_0xf2e36.altKey) {
    _0x4d790a.push("Alt");
  }
  const _0x45fc96 = _normalizeShortcutMainKey(_0xf2e36);
  if (!["Ctrl", "Shift", "Alt", ""].includes(_0x45fc96)) {
    _0x4d790a.push(_0x45fc96);
  }
  return _0x4d790a;
}
function _toShortcutBindingString(_0xc7344e) {
  return _normalizeShortcutKeys(_0xc7344e).join("+").toUpperCase();
}
function _isContextualShortcutConflictExempt(_0x29908a, _0x5c03ee, _0x22a3f7) {
  const _0x325263 = new Set([_0x29908a, _0x5c03ee]);
  if (_0x22a3f7 === "B") {
    return _0x325263.has("toggle-connection-lines") && _0x325263.has("editor-tool-brush");
  }
  if (_0x22a3f7 === "G") {
    return _0x325263.has("ms-sync-video-play") && _0x325263.has("editor-tool-bucket");
  }
  return false;
}
function _resolveSavedShortcutKeys(_0x1564e3, _0x4f1dd9, _0x4bbdfa, _0x80f4ca = {}) {
  const _0xee761a = Array.isArray(_0x4f1dd9);
  const _0x110565 = _0xee761a ? _normalizeShortcutKeys(_0x4f1dd9) : [];
  if (_0x80f4ca.rawSavedPresetName === CUSTOM_PRESET_NAME) {
    if (_0xee761a) {
      return _0x110565;
    } else {
      return _normalizeShortcutKeys(_0x4bbdfa);
    }
  }
  const _0x232712 = _0x80f4ca.savedPresetName === DEFAULT_PRESET_NAME ? DEFAULT_PRESET_SHORTCUT_MIGRATIONS[_0x1564e3] : _0x80f4ca.savedPresetName === ASHUO_PRESET_NAME ? ASHUO_PRESET_SHORTCUT_MIGRATIONS[_0x1564e3] : null;
  const _0x58619d = BUILTIN_PRESET_NAMES.has(_0x80f4ca.savedPresetName) ? BUILTIN_PRESET_SHORTCUT_MIGRATIONS[_0x1564e3] : null;
  if (_0xee761a && _0x232712 && _toShortcutBindingString(_0x110565) === _toShortcutBindingString(_0x232712.from)) {
    return _normalizeShortcutKeys(_0x232712.to);
  }
  if (_0xee761a && _0x58619d && _toShortcutBindingString(_0x110565) === _toShortcutBindingString(_0x58619d.from)) {
    return _normalizeShortcutKeys(_0x58619d.to);
  }
  const _0x3c16c6 = DEFAULT_SHORTCUT_MIGRATIONS[_0x1564e3];
  if (_0xee761a && _0x3c16c6 && _toShortcutBindingString(_0x110565) === _toShortcutBindingString(_0x3c16c6.from)) {
    return _normalizeShortcutKeys(_0x3c16c6.to);
  }
  if (_0xee761a) {
    return _0x110565;
  } else {
    return _normalizeShortcutKeys(_0x4bbdfa);
  }
}
function _resolveSavedAlternateKeys(_0x5a1bd8, _0x31f1a8, _0x2f7d79) {
  const _0x1fc082 = Array.isArray(_0x5a1bd8?.alternateKeys) ? _0x5a1bd8.alternateKeys : _0x2f7d79 === CUSTOM_PRESET_NAME ? [] : _0x31f1a8;
  if (!Array.isArray(_0x1fc082)) {
    return [];
  }
  return _0x1fc082.map(_0x321d00 => _normalizeShortcutKeys(_0x321d00)).filter(_0x191a19 => _0x191a19.length > 0);
}
function _normalizePresetName(_0x35991c) {
  const _0x261a3b = String(_0x35991c || "").trim();
  if (_0x261a3b === "自定义") {
    return CUSTOM_PRESET_NAME;
  }
  if (BUILTIN_PRESET_NAMES.has(_0x261a3b)) {
    return _0x261a3b;
  }
  if (_0x261a3b === CUSTOM_PRESET_NAME) {
    return CUSTOM_PRESET_NAME;
  }
  return ASHUO_PRESET_NAME;
}
function _buildPresetShortcuts(_0x9d9721) {
  const _0x280858 = _normalizePresetName(_0x9d9721);
  const _0x2671ee = PRESETS[_0x280858] || {};
  return Object.fromEntries(Object.entries(DEFAULT_SHORTCUTS).map(([_0x35c83d, _0x2476f4]) => [_0x35c83d, {
    ..._0x2476f4,
    keys: _normalizeShortcutKeys(_0x2671ee[_0x35c83d] ?? [..._0x2476f4.keys])
  }]));
}
function _shortcutsMatchPreset(_0x519f2e, _0x1cc61d) {
  const _0x4b475d = _buildPresetShortcuts(_0x1cc61d);
  return Object.entries(_0x4b475d).every(([_0x593c34, _0xfe39f2]) => {
    const _0x2764ff = _0x519f2e?.[_0x593c34]?.keys || [];
    return _toShortcutBindingString(_0x2764ff) === _toShortcutBindingString(_0xfe39f2.keys);
  });
}
function _inferPresetName(_0x4373cd, _0x18bca3) {
  if (_normalizePresetName(_0x18bca3) === CUSTOM_PRESET_NAME) {
    return CUSTOM_PRESET_NAME;
  }
  if (_shortcutsMatchPreset(_0x4373cd, DEFAULT_PRESET_NAME)) {
    return DEFAULT_PRESET_NAME;
  }
  if (_shortcutsMatchPreset(_0x4373cd, ASHUO_PRESET_NAME)) {
    return ASHUO_PRESET_NAME;
  }
  return CUSTOM_PRESET_NAME;
}
async function _loadFromServer() {
  const _0x3cfe5b = _saveRevision;
  try {
    const _0x5b4631 = await fetchUserShortcutsFromServer();
    if (_0x3cfe5b !== _saveRevision) {
      return;
    }
    if (_0x5b4631 && _0x5b4631.shortcuts && Object.keys(_0x5b4631.shortcuts).length > 0) {
      const _0x3f630d = String(_0x5b4631.preset || "").trim();
      const _0x2aa99b = _normalizePresetName(_0x3f630d);
      const _0x3937c6 = BUILTIN_PRESET_NAMES.has(_0x2aa99b) ? _0x2aa99b : ASHUO_PRESET_NAME;
      const _0x29965d = _buildPresetShortcuts(_0x3937c6);
      _shortcuts = Object.fromEntries(Object.entries(_0x29965d).map(([_0x413302, _0x36694b]) => [_0x413302, _0x5b4631.shortcuts[_0x413302] ? {
        ..._0x36694b,
        keys: _resolveSavedShortcutKeys(_0x413302, _0x5b4631.shortcuts[_0x413302].keys, _0x36694b.keys, {
          savedPresetName: _0x2aa99b,
          rawSavedPresetName: _0x3f630d
        }),
        alternateKeys: _resolveSavedAlternateKeys(_0x5b4631.shortcuts[_0x413302], _0x36694b.alternateKeys, _0x3f630d)
      } : {
        ..._0x36694b,
        keys: _normalizeShortcutKeys(_0x36694b.keys)
      }]));
      _currentPreset = _inferPresetName(_shortcuts, _0x2aa99b);
      if (_shortcuts["matting-auto"]) {
        _shortcuts["matting-auto"].keys = [];
      }
      _updatePresetSelect();
      _render();
      _syncShortcutsToGlobal();
    } else {
      _applyPreset(ASHUO_PRESET_NAME, false);
      _syncShortcutsToGlobal();
    }
  } catch {
    if (_0x3cfe5b !== _saveRevision) {
      return;
    }
    _applyPreset(ASHUO_PRESET_NAME, false);
    _syncShortcutsToGlobal();
  }
}
function _createShortcutSavePayload() {
  return {
    preset: _currentPreset,
    shortcuts: Object.fromEntries(Object.entries(_shortcuts).map(([_0x3bac26, _0x5e12fa]) => [_0x3bac26, {
      keys: _0x5e12fa.keys,
      ...(Array.isArray(_0x5e12fa.alternateKeys) ? {
        alternateKeys: _0x5e12fa.alternateKeys
      } : {})
    }]))
  };
}
function _saveToServer() {
  _saveRevision += 1;
  if (_saveLoopPromise) {
    return _saveLoopPromise;
  }
  _saveLoopPromise = (async () => {
    while (true) {
      const _0xc2d0c6 = _saveRevision;
      const _0x41fefc = _createShortcutSavePayload();
      try {
        await saveUserShortcutsToServer(_0x41fefc);
        _syncShortcutsToGlobal();
      } catch (_0x3769d0) {
        console.warn("[shortcuts] save failed:", _0x3769d0);
      }
      if (_0xc2d0c6 === _saveRevision) {
        break;
      }
    }
  })().finally(() => {
    _saveLoopPromise = null;
  });
  return _saveLoopPromise;
}
function _syncShortcutsToGlobal() {
  if (typeof window === "undefined") {
    return;
  }
  window.__aicConfiguredShortcutBindings = Array.from(new Set(Object.entries(_shortcuts).flatMap(([_0x36e288, _0x34c2bd]) => _getShortcutBindingStrings(_0x36e288, _0x34c2bd))));
  const _0x2a778c = {};
  const _0x357886 = ["editor-tool-brush", "editor-tool-eraser", "editor-tool-bucket", "editor-clear"];
  _0x357886.forEach(_0x1c018a => {
    if (_shortcuts[_0x1c018a]?.keys?.length > 0) {
      const _0x43c755 = _shortcuts[_0x1c018a].keys[_shortcuts[_0x1c018a].keys.length - 1];
      _0x2a778c[_0x1c018a] = _0x43c755.toUpperCase();
    }
  });
  window._mattingShortcuts = _0x2a778c;
  _syncCanvasScreenshotShortcutToElectron();
}
function _syncCanvasScreenshotShortcutToElectron() {
  if (typeof window === "undefined") {
    return;
  }
  if (!desktopBridge.screenshot.isAvailable()) {
    return;
  }
  const _0x5021ab = Array.isArray(_shortcuts?.["canvas-screenshot"]?.keys) ? _shortcuts["canvas-screenshot"].keys : DEFAULT_SHORTCUTS["canvas-screenshot"].keys;
  try {
    const _0x37308a = desktopBridge.screenshot.updateGlobalShortcut({
      keys: _0x5021ab
    });
    if (_0x37308a && typeof _0x37308a.catch === "function") {
      _0x37308a.catch(_0x1f6675 => {
        console.warn("[shortcuts] failed to sync global screenshot shortcut:", _0x1f6675);
      });
    }
  } catch (_0x23d9c6) {
    console.warn("[shortcuts] failed to sync global screenshot shortcut:", _0x23d9c6);
  }
}
function _applyPreset(_0xb2a6e, _0x493855 = true) {
  const _0x4659ab = _normalizePresetName(_0xb2a6e);
  if (!BUILTIN_PRESET_NAMES.has(_0x4659ab)) {
    return;
  }
  _currentPreset = _0x4659ab;
  _shortcuts = _buildPresetShortcuts(_0x4659ab);
  _render();
  _syncShortcutsToGlobal();
  _emitShortcutsUpdated();
  if (_0x493855) {
    _saveToServer();
  }
}
function _getPresetControls() {
  if (typeof document === "undefined") {
    return {};
  }
  const _0x47be42 = document.getElementById("shortcutsPresetSelect");
  const _0x562d54 = document.getElementById("shortcutsPresetControl");
  const _0x4691aa = document.getElementById("shortcutsPresetTrigger");
  const _0x1af578 = document.getElementById("shortcutsPresetTriggerText");
  const _0x3476c9 = document.getElementById("shortcutsPresetMenu");
  const _0x598cd5 = _0x3476c9?.querySelectorAll ? Array.from(_0x3476c9.querySelectorAll(".settings-preset-option")) : [];
  return {
    select: _0x47be42,
    control: _0x562d54,
    trigger: _0x4691aa,
    triggerText: _0x1af578,
    menu: _0x3476c9,
    options: _0x598cd5
  };
}
function _getPresetLabel(_0x57d4e3) {
  const {
    select: _0x3dc2c0,
    options: _0x5497d6
  } = _getPresetControls();
  const _0x5be7a2 = _0x3dc2c0?.options ? Array.from(_0x3dc2c0.options).find(_0x1112b8 => _0x1112b8.value === _0x57d4e3) : null;
  const _0x3b677e = _0x5497d6.find(_0x509cda => _0x509cda.dataset?.value === _0x57d4e3);
  return _0x5be7a2?.textContent || _0x3b677e?.textContent || _0x57d4e3;
}
function _setPresetMenuOpen(_0x5d62e3, {
  focusOption = false,
  focusTrigger = false
} = {}) {
  const {
    control: _0x218a4f,
    trigger: _0x88ba93,
    menu: _0x229e26,
    options: _0xa88ded
  } = _getPresetControls();
  if (!_0x218a4f || !_0x88ba93 || !_0x229e26) {
    return;
  }
  _0x218a4f.classList.toggle("is-open", _0x5d62e3);
  _0x88ba93.setAttribute("aria-expanded", _0x5d62e3 ? "true" : "false");
  _0x229e26.hidden = !_0x5d62e3;
  if (_0x5d62e3 && focusOption) {
    const _0x4d34cf = _0xa88ded.find(_0x3f5375 => _0x3f5375.dataset?.value === _currentPreset && !_0x3f5375.disabled);
    const _0x20b093 = _0xa88ded.find(_0x26e084 => !_0x26e084.disabled);
    (_0x4d34cf || _0x20b093)?.focus?.();
  } else if (!_0x5d62e3 && focusTrigger) {
    _0x88ba93.focus?.();
  }
}
function _isPresetMenuOpen() {
  const {
    control: _0x3f42f5
  } = _getPresetControls();
  return !!_0x3f42f5?.classList?.contains("is-open");
}
function _selectPresetFromUi(_0x42fa3f) {
  if (_normalizePresetName(_0x42fa3f) === CUSTOM_PRESET_NAME) {
    _updatePresetSelect();
    _setPresetMenuOpen(false, {
      focusTrigger: true
    });
    return;
  }
  const _0x18156f = _normalizePresetName(_0x42fa3f);
  _applyPreset(_0x18156f, true);
  _updatePresetSelect();
  _setPresetMenuOpen(false, {
    focusTrigger: true
  });
  window.showToast?.(_tShortcut("presetSwitched", "已切换预设：" + _0x18156f, {
    preset: _getPresetLabel(_0x18156f)
  }));
}
function _movePresetOptionFocus(_0x2d72d0) {
  const {
    options: _0x2580dc
  } = _getPresetControls();
  const _0x5ee302 = _0x2580dc.filter(_0x1c45d9 => !_0x1c45d9.disabled);
  if (_0x5ee302.length === 0) {
    return;
  }
  const _0x205db6 = document.activeElement;
  let _0x409999 = _0x5ee302.indexOf(_0x205db6);
  if (_0x409999 < 0) {
    _0x409999 = _0x5ee302.findIndex(_0x1a1b62 => _0x1a1b62.dataset?.value === _currentPreset);
  }
  const _0x474558 = (Math.max(_0x409999, 0) + _0x2d72d0 + _0x5ee302.length) % _0x5ee302.length;
  _0x5ee302[_0x474558]?.focus?.();
}
function _updatePresetSelect() {
  const {
    select: _0x418496,
    triggerText: _0x201f5b,
    options: _0x1d8a12
  } = _getPresetControls();
  if (_0x418496) {
    _0x418496.value = _currentPreset;
  }
  if (_0x201f5b) {
    _0x201f5b.textContent = _getPresetLabel(_currentPreset);
  }
  _0x1d8a12.forEach(_0x2209c8 => {
    const _0x17a947 = _0x2209c8.dataset?.value === _currentPreset;
    _0x2209c8.classList.toggle("is-active", _0x17a947);
    _0x2209c8.setAttribute("aria-selected", _0x17a947 ? "true" : "false");
  });
}
function _initPresetSelect() {
  const {
    select: _0xbaa66c,
    control: _0x75c1ef,
    trigger: _0x4a0c9f,
    menu: _0x157fe4
  } = _getPresetControls();
  if (_0xbaa66c && !_0xbaa66c.dataset.presetSelectBound) {
    _0xbaa66c.dataset.presetSelectBound = "true";
    _0xbaa66c.addEventListener("change", () => {
      _selectPresetFromUi(_0xbaa66c.value);
    });
  }
  if (!_0x75c1ef || !_0x4a0c9f || !_0x157fe4 || _0x4a0c9f.dataset.presetSelectBound) {
    _updatePresetSelect();
    return;
  }
  _0x4a0c9f.dataset.presetSelectBound = "true";
  _0x4a0c9f.addEventListener("click", () => {
    _setPresetMenuOpen(!_isPresetMenuOpen(), {
      focusOption: true
    });
  });
  _0x4a0c9f.addEventListener("keydown", _0x4a31e3 => {
    if (_0x4a31e3.key === "ArrowDown" || _0x4a31e3.key === "Enter" || _0x4a31e3.key === " ") {
      _0x4a31e3.preventDefault();
      _setPresetMenuOpen(true, {
        focusOption: true
      });
    }
  });
  _0x157fe4.addEventListener("click", _0x19c98a => {
    const _0x586eba = _0x19c98a.target?.closest?.(".settings-preset-option");
    if (!_0x586eba || _0x586eba.disabled) {
      return;
    }
    _selectPresetFromUi(_0x586eba.dataset.value);
  });
  _0x157fe4.addEventListener("keydown", _0x2771de => {
    if (_0x2771de.key === "Escape") {
      _0x2771de.preventDefault();
      _setPresetMenuOpen(false, {
        focusTrigger: true
      });
    } else if (_0x2771de.key === "ArrowDown") {
      _0x2771de.preventDefault();
      _movePresetOptionFocus(1);
    } else if (_0x2771de.key === "ArrowUp") {
      _0x2771de.preventDefault();
      _movePresetOptionFocus(-1);
    } else if (_0x2771de.key === "Enter" || _0x2771de.key === " ") {
      _0x2771de.preventDefault();
      const _0x39d9d4 = document.activeElement?.closest?.(".settings-preset-option");
      if (_0x39d9d4 && !_0x39d9d4.disabled) {
        _selectPresetFromUi(_0x39d9d4.dataset.value);
      }
    }
  });
  document.addEventListener("pointerdown", _0x559735 => {
    if (!_isPresetMenuOpen()) {
      return;
    }
    if (typeof _0x75c1ef.contains === "function" && _0x75c1ef.contains(_0x559735.target)) {
      return;
    }
    _setPresetMenuOpen(false);
  });
  _updatePresetSelect();
}
function _normalizeShortcutSearchText(_0x4fb9fd) {
  return String(_0x4fb9fd || "").trim().toLocaleLowerCase();
}
function _matchesShortcutSearch(_0x267738, _0x4e80d0, _0xb08a21, _0x420836) {
  const _0x16ba2c = _normalizeShortcutSearchText(_0x420836);
  if (!_0x16ba2c) {
    return true;
  }
  const _0x17f1a6 = _getShortcutBindingStrings(_0x267738, _0x4e80d0);
  const _0x5cbac3 = _0x17f1a6.length > 0 ? _0x17f1a6.flatMap(_0x24a851 => [_0x24a851, _0x24a851.replaceAll("+", " ")]) : [_tShortcut("unset", "未设置")];
  const _0x4934d7 = _normalizeShortcutSearchText([_0x267738, _0x4e80d0.label, _translateShortcutAction(_0x267738, _0x4e80d0.label), _0xb08a21, _translateShortcutGroup(_0xb08a21), ..._0x5cbac3].join(" "));
  return _0x16ba2c.split(/\s+/).filter(Boolean).every(_0x4b8bed => _0x4934d7.includes(_0x4b8bed));
}
function _render() {
  const _0x4169c9 = document.getElementById("shortcutsContent");
  if (!_0x4169c9) {
    return;
  }
  _0x4169c9.replaceChildren();
  const _0x4d81b9 = {};
  Object.entries(_shortcuts).forEach(([_0x146c3d, _0x59d51a]) => {
    if (_0x59d51a.hidden) {
      return;
    }
    if (!_matchesShortcutSearch(_0x146c3d, _0x59d51a, _0x59d51a.group, _shortcutSearchQuery)) {
      return;
    }
    if (!_0x4d81b9[_0x59d51a.group]) {
      _0x4d81b9[_0x59d51a.group] = [];
    }
    _0x4d81b9[_0x59d51a.group].push({
      id: _0x146c3d,
      ..._0x59d51a
    });
  });
  if (Object.keys(_0x4d81b9).length === 0 && _normalizeShortcutSearchText(_shortcutSearchQuery)) {
    const _0x52b409 = document.createElement("div");
    _0x52b409.className = "sc-empty";
    _0x52b409.setAttribute("role", "status");
    _0x52b409.setAttribute("aria-live", "polite");
    _0x52b409.textContent = _tShortcut("noResults", "没有找到匹配的快捷键");
    _0x4169c9.appendChild(_0x52b409);
    return;
  }
  Object.entries(_0x4d81b9).forEach(([_0xd67c1, _0xa39591]) => {
    const _0x346705 = document.createElement("div");
    _0x346705.className = "sc-section";
    const _0x3c8f01 = document.createElement("div");
    _0x3c8f01.className = "sc-section-title";
    _0x3c8f01.textContent = _translateShortcutGroup(_0xd67c1);
    _0x346705.appendChild(_0x3c8f01);
    _0xa39591.forEach(_0x2795c3 => {
      const _0x50d23d = document.createElement("div");
      _0x50d23d.className = "sc-item";
      const _0x4358e2 = document.createElement("span");
      _0x4358e2.className = "sc-label";
      _0x4358e2.textContent = _translateShortcutAction(_0x2795c3.id, _0x2795c3.label);
      const _0x45d8a1 = document.createElement("div");
      _0x45d8a1.className = "sc-keys";
      _0x45d8a1.dataset.action = _0x2795c3.id;
      _0x45d8a1.replaceChildren();
      if (_recordingAction === _0x2795c3.id) {
        const _0x10587e = document.createElement("kbd");
        _0x10587e.className = "kbd-v2 recording";
        _0x10587e.textContent = _tShortcut("recording", "录制中...");
        _0x45d8a1.appendChild(_0x10587e);
      } else if (_0x2795c3.keys.length > 0) {
        _0x2795c3.keys.forEach(_0x1ca784 => {
          const _0x52eccc = document.createElement("kbd");
          _0x52eccc.className = "kbd-v2";
          _0x52eccc.textContent = _0x1ca784;
          _0x45d8a1.appendChild(_0x52eccc);
        });
      } else {
        const _0x428d2c = document.createElement("kbd");
        _0x428d2c.className = "kbd-v2";
        _0x428d2c.textContent = _tShortcut("unset", "未设置");
        _0x45d8a1.appendChild(_0x428d2c);
      }
      _0x45d8a1.addEventListener("click", () => _startRecording(_0x2795c3.id));
      _0x50d23d.appendChild(_0x4358e2);
      _0x50d23d.appendChild(_0x45d8a1);
      _0x346705.appendChild(_0x50d23d);
    });
    _0x4169c9.appendChild(_0x346705);
  });
}
function _initShortcutSearch() {
  const _0x17f733 = document.getElementById("shortcutsSearchInput");
  if (!_0x17f733) {
    return;
  }
  _shortcutSearchQuery = _0x17f733.value || "";
  if (_0x17f733.dataset.shortcutSearchBound) {
    _render();
    return;
  }
  _0x17f733.dataset.shortcutSearchBound = "true";
  _0x17f733.addEventListener("input", _0x4e77da => {
    _shortcutSearchQuery = _0x4e77da.target?.value || "";
    _render();
  });
  _0x17f733.addEventListener("keydown", _0x2b8cc5 => {
    if (_0x2b8cc5.key !== "Escape" || !_0x17f733.value) {
      return;
    }
    _0x2b8cc5.preventDefault();
    _0x2b8cc5.stopPropagation();
    _0x17f733.value = "";
    _shortcutSearchQuery = "";
    _render();
  });
}
function _startRecording(_0xda342a) {
  if (_recordingAction) {
    return;
  }
  _setRecordingAction(_0xda342a);
  _render();
}
export function detectShortcutConflict(_0x268a68, _0x781bd9, _0x366a6f) {
  if (!_0x268a68 || typeof _0x268a68 !== "object") {
    return null;
  }
  const _0x5adef7 = _toShortcutBindingString(_0x366a6f);
  if (!_0x5adef7) {
    return null;
  }
  for (const [_0x34961e, _0x22641a] of Object.entries(_0x268a68)) {
    if (_0x34961e === _0x781bd9) {
      continue;
    }
    if (_getShortcutBindingStrings(_0x34961e, _0x22641a).includes(_0x5adef7)) {
      if (_isContextualShortcutConflictExempt(_0x781bd9, _0x34961e, _0x5adef7)) {
        continue;
      }
      return {
        id: _0x34961e,
        label: _0x22641a.label || _0x34961e
      };
    }
  }
  return null;
}
function _stopRecording(_0x1410f5) {
  if (!_recordingAction) {
    return;
  }
  if (_0x1410f5 && _0x1410f5.length > 0) {
    const _0x1e3f35 = detectShortcutConflict(_shortcuts, _recordingAction, _0x1410f5);
    if (_0x1e3f35) {
      window.showToast?.(_tShortcut("conflict", "快捷键冲突：已被「" + _0x1e3f35.label + "」占用", {
        label: _translateShortcutAction(_0x1e3f35.id, _0x1e3f35.label)
      }), "warn");
      _setRecordingAction(null);
      _render();
      return;
    }
    _shortcuts[_recordingAction].keys = _normalizeShortcutKeys(_0x1410f5);
    _shortcuts[_recordingAction].alternateKeys = [];
    _currentPreset = CUSTOM_PRESET_NAME;
    _updatePresetSelect();
    _syncShortcutsToGlobal();
    _emitShortcutsUpdated();
    _saveToServer();
    window.showToast?.(_tShortcut("updated", "快捷键已更新"), "success");
  }
  _setRecordingAction(null);
  _render();
}
function _reset() {
  _applyPreset(DEFAULT_PRESET_NAME, true);
  _updatePresetSelect();
  window.showToast?.(_tShortcut("restored", "已恢复默认快捷键"));
}
function _dispatchWebPreviewSettingsSync(_0x32ae73) {
  if (typeof window === "undefined" || typeof window.dispatchEvent !== "function") {
    return;
  }
  const _0x2c18e6 = {
    reason: _0x32ae73
  };
  const _0x471801 = typeof CustomEvent === "function" ? new CustomEvent("web-preview:force-sync", {
    detail: _0x2c18e6
  }) : {
    type: "web-preview:force-sync",
    detail: _0x2c18e6
  };
  window.dispatchEvent(_0x471801);
}
export function openShortcuts() {
  const _0x326e39 = document.getElementById("settingsOverlay");
  if (!_0x326e39) {
    return;
  }
  _0x326e39.style.display = "block";
  _dispatchWebPreviewSettingsSync("shortcuts-open");
  const _0x5876e6 = document.querySelectorAll(".settings-nav-item");
  const _0x1eaf38 = document.querySelectorAll(".settings-pane");
  _0x5876e6.forEach(_0x21ce36 => {
    _0x21ce36.classList.toggle("active", _0x21ce36.dataset.pane === "shortcuts");
  });
  _0x1eaf38.forEach(_0x536eac => {
    _0x536eac.classList.toggle("active", _0x536eac.id === "pane-shortcuts");
  });
  _render();
  _updatePresetSelect();
}
export function closeShortcuts() {
  const _0x4f01c7 = document.getElementById("settingsOverlay");
  if (_0x4f01c7) {
    _0x4f01c7.style.display = "none";
    _dispatchWebPreviewSettingsSync("shortcuts-close");
  }
  if (_recordingAction) {
    _setRecordingAction(null);
    _render();
  }
}
export function getShortcuts() {
  return _shortcuts;
}
export function getInitialShortcuts() {
  return _buildPresetShortcuts(ASHUO_PRESET_NAME);
}
export function getCurrentPreset() {
  return _currentPreset;
}
export function isRecording() {
  return !!_recordingAction;
}
export function handleShortcutKeydown(_0x8d2a73, _0x1d673b = {}) {
  if (_recordingAction) {
    return null;
  }
  const _0x447b76 = _toShortcutBindingString(_buildShortcutKeysFromEvent(_0x8d2a73));
  let _0xf066e1 = [];
  for (const [_0x3a42d0, _0x5ba427] of Object.entries(_shortcuts)) {
    if (_getShortcutBindingStrings(_0x3a42d0, _0x5ba427).includes(_0x447b76)) {
      _0xf066e1.push(_0x3a42d0);
    }
  }
  _0xf066e1 = _filterShortcutMatchesByContext(_0xf066e1, _0x1d673b);
  if (_0xf066e1.length === 0) {
    return null;
  }
  return _resolveShortcutMatch(_0xf066e1, _0x1d673b);
}
function _handleRecordingKeydown(_0x39ec34) {
  if (!_recordingAction) {
    return;
  }
  _0x39ec34.preventDefault();
  _0x39ec34.stopImmediatePropagation();
  if (_0x39ec34.key === "Escape") {
    _stopRecording(null);
    return;
  }
  const _0x32ce43 = _buildShortcutKeysFromEvent(_0x39ec34);
  const _0x6f6bb4 = _normalizeShortcutMainKey(_0x39ec34);
  const _0x5e5629 = MODIFIER_ONLY_SHORTCUT_ACTIONS.has(_recordingAction);
  if (_0x32ce43.length > 0 && (_0x5e5629 || !["Ctrl", "Shift", "Alt", ""].includes(_0x6f6bb4))) {
    _stopRecording(_0x32ce43);
  }
}
if (typeof document !== "undefined" && document?.addEventListener) {
  onLocaleChange(() => {
    _render();
    _updatePresetSelect();
  });
  const recordingEventTarget = typeof window !== "undefined" && window?.addEventListener ? window : document;
  recordingEventTarget.addEventListener("keydown", _handleRecordingKeydown, true);
  if (typeof window !== "undefined" && window?.addEventListener) {
    window.addEventListener("settings-panel-closed", () => {
      if (!_recordingAction) {
        return;
      }
      _stopRecording(null);
    });
  }
  document.addEventListener("DOMContentLoaded", () => {
    _loadFromServer();
    document.getElementById("btnShortcutsClose")?.addEventListener("click", closeShortcuts);
    document.getElementById("btnResetShortcuts")?.addEventListener("click", _0x27740b => {
      _0x27740b.stopPropagation();
      _reset();
    });
    document.getElementById("btnShortcutsClose")?.addEventListener("click", closeShortcuts);
    document.getElementById("btnShortcuts")?.addEventListener("click", _0x1a1c0f => {
      _0x1a1c0f.stopPropagation();
      document.getElementById("avatarMenu")?.classList.remove("open");
      openShortcuts();
    });
    _initPresetSelect();
    _initShortcutSearch();
  });
}