import { localPathToUrl } from "../../utils/localMediaPath.js";
import { getWorkspaceProjectHomeEntries, renderWorkspaceProjectCard, renderWorkspaceProjectSortControl } from "../workspaceProjectHome.js";
import { SMART_CLIP_FPS_OPTIONS } from "../../services/smartClipJobService.js";
import { t } from "../../i18n/index.js";
import { getPersonReplacementCharacterBaseImageRef } from "./personReplacementProject.js";
import { getPersonReplacementProjectTaskSummary, isPersonReplacementSourceProcessing } from "./personReplacementProjectSession.js";
import { PERSON_REPLACEMENT_STEPS, getPersonReplacementStepCompletion, getPersonReplacementStepGate } from "./personReplacementWorkflow.js";
import { REPLACEMENT_STUDIO_NAME } from "./replacementStudioTerminology.js";
function escapeHtml(_0x599b41) {
  return String(_0x599b41 ?? "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll("\"", "&quot;").replaceAll("'", "&#39;");
}
function normalizeText(_0x40ed2a, _0x378bac = "") {
  const _0x31927f = String(_0x40ed2a ?? "").trim();
  return _0x31927f || _0x378bac;
}
function normalizeMediaUrl(_0x40c1a7) {
  const _0x473151 = normalizeText(_0x40c1a7);
  if (_0x473151) {
    return localPathToUrl(_0x473151) || _0x473151;
  } else {
    return "";
  }
}
function clamp(_0x2deb2a, _0x45fdd7, _0x1c51c6, _0x274519 = _0x45fdd7) {
  const _0x467fa1 = Number(_0x2deb2a);
  if (!Number.isFinite(_0x467fa1)) {
    return _0x274519;
  }
  return Math.max(_0x45fdd7, Math.min(_0x1c51c6, _0x467fa1));
}
function renderVideoIcon() {
  return "<svg class=\"person-replacement-icon\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.7\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><rect x=\"3\" y=\"5\" width=\"14\" height=\"14\" rx=\"3\"/><path d=\"m17 10 4-2v8l-4-2\"/></svg>";
}
function smartClipPanelText(_0x4c7452, _0x3f2bee = {}) {
  return t("videoClip.smartPanel." + _0x4c7452, _0x3f2bee);
}
function renderSmartClipSettingLabel(_0x492f3b, _0x25267b) {
  return "<span class=\"person-replacement-smart-clip-setting-label\">" + escapeHtml(_0x492f3b) + "<span class=\"rh-tip\" data-tooltip=\"" + escapeHtml(_0x25267b) + "\" aria-label=\"" + escapeHtml(_0x25267b) + "\">!</span></span>";
}
function renderSmartClipModeOptions(_0x327a82) {
  const _0x5a6c52 = [["stable", smartClipPanelText("modeStable")], ["balanced", smartClipPanelText("modeBalanced")], ["sensitive", smartClipPanelText("modeSensitive")]];
  return _0x5a6c52.map(([_0x3c4ae7, _0xf3f27c]) => "<button type=\"button\" class=\"person-replacement-smart-clip-option " + (_0x327a82 === _0x3c4ae7 ? "is-active" : "") + "\" data-person-replacement-action=\"set-smart-clip-mode\" data-smart-clip-mode=\"" + _0x3c4ae7 + "\" aria-pressed=\"" + (_0x327a82 === _0x3c4ae7) + "\">" + escapeHtml(_0xf3f27c) + "</button>").join("");
}
function renderSmartClipSettingsPanel(_0x59caf9) {
  const _0x30bf90 = _0x59caf9.settings.smartClipMode;
  const _0x47853a = _0x59caf9.settings.smartClipFps;
  return "<div class=\"person-replacement-smart-clip-settings-panel\" role=\"dialog\" aria-label=\"" + escapeHtml(smartClipPanelText("title")) + "\">\n    <strong class=\"person-replacement-smart-clip-settings-title\">" + escapeHtml(smartClipPanelText("title")) + "</strong>\n    <div class=\"person-replacement-smart-clip-setting-row\">\n      " + renderSmartClipSettingLabel(smartClipPanelText("mode"), smartClipPanelText("modeTip")) + "\n      <div class=\"person-replacement-smart-clip-option-group\" role=\"group\" aria-label=\"" + escapeHtml(smartClipPanelText("mode")) + "\">\n        " + renderSmartClipModeOptions(_0x30bf90) + "\n      </div>\n    </div>\n    <div class=\"person-replacement-smart-clip-setting-row\">\n      " + renderSmartClipSettingLabel(smartClipPanelText("fps"), smartClipPanelText("fpsTip")) + "\n      <div class=\"person-replacement-smart-clip-option-group\" role=\"group\" aria-label=\"" + escapeHtml(smartClipPanelText("fps")) + "\">\n        " + SMART_CLIP_FPS_OPTIONS.map(_0x263b4e => "<button type=\"button\" class=\"person-replacement-smart-clip-option person-replacement-smart-clip-fps-option " + (_0x47853a === _0x263b4e ? "is-active" : "") + "\" data-person-replacement-action=\"set-smart-clip-fps\" data-smart-clip-fps=\"" + _0x263b4e + "\" aria-pressed=\"" + (_0x47853a === _0x263b4e) + "\">" + escapeHtml(smartClipPanelText("fpsValue", {
    fps: _0x263b4e
  })) + "</button>").join("") + "\n      </div>\n    </div>\n    <p class=\"person-replacement-smart-clip-settings-hint\">" + escapeHtml(smartClipPanelText("hintDefault")) + "</p>\n  </div>";
}
function renderSmartClipSettings(_0x196f89) {
  const _0x59ab97 = _0x196f89.workspace.smartClipSettingsOpen === true;
  return "<div class=\"person-replacement-smart-clip-settings\" data-person-replacement-smart-clip-settings>\n    <button type=\"button\" class=\"story-secondary-button person-replacement-settings-trigger " + (_0x59ab97 ? "is-active" : "") + "\" data-person-replacement-action=\"toggle-smart-clip-settings\" aria-haspopup=\"dialog\" aria-expanded=\"" + _0x59ab97 + "\">设置</button>\n    " + (_0x59ab97 ? renderSmartClipSettingsPanel(_0x196f89) : "") + "\n  </div>";
}
function renderStepNavigation(_0x38967a) {
  const _0x47eaff = getPersonReplacementStepCompletion(_0x38967a);
  return "<nav class=\"story-step-navigation person-replacement-story-steps\" data-active-step=\"" + _0x38967a.workspace.step + "\" aria-label=\"人物替换流程\">\n    " + PERSON_REPLACEMENT_STEPS.map(_0x48fc89 => {
    const _0xdcd160 = getPersonReplacementStepGate(_0x38967a, _0x48fc89.id, _0x47eaff);
    const _0x2a5121 = ["story-step", _0x38967a.workspace.step === _0x48fc89.id ? "is-active" : "", _0xdcd160.allowed ? "" : "is-locked"].filter(Boolean).join(" ");
    return "<button type=\"button\" class=\"" + _0x2a5121 + "\" data-person-replacement-action=\"select-step\" data-person-replacement-step=\"" + _0x48fc89.id + "\" aria-current=\"" + (_0x38967a.workspace.step === _0x48fc89.id ? "step" : "false") + "\" aria-keyshortcuts=\"" + _0x48fc89.id + "\" aria-disabled=\"" + !_0xdcd160.allowed + "\"" + (_0xdcd160.allowed ? "" : " title=\"" + escapeHtml(_0xdcd160.message) + "\"") + "><span>" + _0x48fc89.id + "</span>" + escapeHtml(_0x48fc89.label) + "</button>";
  }).join("") + "\n  </nav>";
}
function getStepGuidance(_0x5adf85, _0x436c26) {
  const _0x2458a1 = Math.trunc(clamp(_0x5adf85.workspace?.step, 1, 5, 1));
  const _0x2a739e = getPersonReplacementStepCompletion(_0x5adf85);
  const _0x19f8cc = (Array.isArray(_0x5adf85.characters) ? _0x5adf85.characters : []).filter(_0x36d54b => getPersonReplacementCharacterBaseImageRef(_0x36d54b)).length;
  const _0x186153 = (Array.isArray(_0x5adf85.scenes) ? _0x5adf85.scenes : []).filter(_0x1dd983 => getPersonReplacementCharacterBaseImageRef(_0x1dd983)).length;
  const _0x159ebb = _0x19f8cc + _0x186153;
  const _0x4b17e2 = Array.isArray(_0x5adf85.shots) ? _0x5adf85.shots : [];
  const _0x53d62b = _0x4b17e2.filter(_0x4a46bf => normalizeText(_0x4a46bf?.resultVideoRef)).length;
  const _0x38eb01 = Math.max(0, Math.trunc(Number(_0x436c26(_0x5adf85)) || 0));
  const _0x94e16a = Boolean(normalizeText(_0x5adf85.audio?.replacementAudioRef));
  const _0x3c2d35 = Boolean(_0x5adf85.output?.originalMasterRef && (_0x5adf85.output?.finalVideoRef || _0x5adf85.output?.visualMasterRef));
  const _0x378d77 = _0x5adf85.output?.composeStatus === "succeeded" && _0x3c2d35;
  const _0x32a7b2 = _0x3c2d35 && !_0x378d77;
  if (_0x2458a1 === 1) {
    if (_0x2a739e.assetSettingsComplete) {
      return {
        title: "替换素材已应用",
        detail: "已应用 " + _0x159ebb + " 个替换素材，可以继续进入图像替换"
      };
    } else {
      return {
        title: "请添加人物或场景素材",
        detail: "至少添加 1 个人物或场景素材，才能进入图像替换"
      };
    }
  }
  if (_0x2458a1 === 2) {
    if (_0x2a739e.imageReplacementComplete) {
      return {
        title: "图像替换输入已应用",
        detail: "可以继续生成替换图，或进入视频替换"
      };
    } else {
      return {
        title: "请绑定替换人物或场景",
        detail: "可先进入视频替换；添加人物或场景绑定后才能继续声音克隆"
      };
    }
  }
  if (_0x2458a1 === 3) {
    if (!_0x2a739e.imageReplacementComplete) {
      return {
        title: "请绑定替换人物或场景",
        detail: "至少绑定 1 个人物或场景，才能进入声音克隆"
      };
    }
    if (_0x53d62b > 0) {
      return {
        title: "替换视频已生成",
        detail: "已生成 " + _0x53d62b + "/" + _0x4b17e2.length + " 个片段，可以继续进入声音克隆"
      };
    }
    return {
      title: "视频替换已就绪",
      detail: "可以生成替换视频，也可以继续进入声音克隆"
    };
  }
  if (_0x2458a1 === 4) {
    if (_0x94e16a) {
      return {
        title: "替换音轨已应用",
        detail: "可以继续进入合成视频，检查并生成最终视频"
      };
    }
    if (_0x38eb01 > 0) {
      return {
        title: "声音参考已应用",
        detail: "已应用 " + _0x38eb01 + " 个声音参考，可以继续克隆声音或进入合成视频"
      };
    }
    return {
      title: "可添加声音参考",
      detail: "上传人物声音参考后可克隆音轨，也可以直接进入合成视频"
    };
  }
  if (_0x32a7b2) {
    return {
      title: "旧合成视频仍可查看",
      detail: "图像或片段已更新，重新生成对应替换视频后再合成"
    };
  }
  if (_0x378d77) {
    return {
      title: "完整画面已就绪",
      detail: "可以切换原声或替换声预览，导出时再封装当前音轨"
    };
  }
  if (_0x53d62b > 0) {
    return {
      title: "替换片段可以合成",
      detail: "已有 " + _0x53d62b + "/" + _0x4b17e2.length + " 个片段可用于合成"
    };
  }
  return {
    title: "请先生成替换视频",
    detail: "返回视频替换生成至少一个片段后，即可创建合成预览"
  };
}
function getCurrentCanvasSyncMenuCopy(_0x4ddd06) {
  const _0x28c2c0 = Math.trunc(Number(_0x4ddd06) || 1);
  const _0xf30fdd = {
    1: ["同步素材设定到画布", "同步当前人物素材与分组"],
    2: ["同步图像替换到画布", "同步当前关键帧、定位图、素材、提示词与替换结果图"],
    3: ["同步视频替换到画布", "同步当前原视频、替换图与替换视频"],
    4: ["同步声音克隆到画布", "同步当前原音频、参考音频与替换音频"],
    5: ["同步所有片段到画布", "按镜头顺序同步已有的替换视频片段"]
  };
  const [_0x592a41, _0x123485] = _0xf30fdd[_0x28c2c0] || _0xf30fdd[5];
  return {
    label: _0x592a41,
    detail: _0x123485
  };
}
function renderProjectToolbarActions(_0x26381e, _0xd00d8b = {}) {
  const _0x16fe59 = _0x26381e.workspace.step === 5;
  const _0x217afa = getCurrentCanvasSyncMenuCopy(_0x26381e.workspace.step);
  const _0x3ecd66 = _0xd00d8b.canvasSyncPending === true;
  const _0x1b36e4 = _0xd00d8b.exportOutputPending === true;
  const _0x232bc1 = "<div class=\"story-canvas-sync-menu-wrap" + (_0x3ecd66 ? " is-loading" : "") + "\" data-person-replacement-output-menu=\"canvas\" data-person-replacement-canvas-sync-pending=\"" + _0x3ecd66 + "\">\n    <button type=\"button\" class=\"story-workbench-action-button story-canvas-sync-trigger story-menu-trigger" + (_0x3ecd66 ? " is-loading" : "") + "\" data-person-replacement-action=\"toggle-output-menu\" data-person-replacement-output-menu-trigger=\"canvas\" aria-haspopup=\"menu\" aria-expanded=\"false\" aria-busy=\"" + _0x3ecd66 + "\"" + (_0x3ecd66 ? " disabled" : "") + ">\n      " + (_0x3ecd66 ? "<span class=\"storyboard-script-loading-spinner person-replacement-canvas-sync-spinner\" aria-hidden=\"true\"></span>" : "") + "<span>" + (_0x3ecd66 ? "加入中…" : "加入画布") + "</span>" + (_0x3ecd66 ? "" : "<span class=\"story-canvas-sync-chevron\" aria-hidden=\"true\"></span>") + "\n    </button>\n    <div class=\"story-canvas-sync-menu\" role=\"menu\" aria-label=\"同步人物替换项目到画布\" aria-hidden=\"true\">\n      <button type=\"button\" class=\"story-canvas-sync-option\" data-person-replacement-action=\"sync-all-clips-to-canvas\" role=\"menuitem\"" + (_0x3ecd66 ? " aria-disabled=\"true\" disabled" : "") + ">\n        <strong>" + _0x217afa.label + "</strong><small>" + _0x217afa.detail + "</small>\n      </button>\n      <button type=\"button\" class=\"story-canvas-sync-option\" data-person-replacement-action=\"sync-project-to-canvas\" role=\"menuitem\"" + (_0x3ecd66 ? " aria-disabled=\"true\" disabled" : "") + ">\n        <strong>同步整个项目到画布</strong><small>按当前进度同步素材、图像、视频、音频与合成节点</small>\n      </button>\n    </div>\n  </div>";
  const _0x18065c = _0x16fe59 ? "<div class=\"story-canvas-sync-menu-wrap story-clip-export-menu-wrap" + (_0x1b36e4 ? " is-loading" : "") + "\" data-person-replacement-output-menu=\"export\" data-person-replacement-export-pending=\"" + _0x1b36e4 + "\">\n      <button type=\"button\" class=\"story-workbench-action-button story-canvas-sync-trigger story-menu-trigger" + (_0x1b36e4 ? " is-loading" : "") + "\" data-person-replacement-action=\"toggle-output-menu\" data-person-replacement-output-menu-trigger=\"export\" aria-haspopup=\"menu\" aria-expanded=\"false\" aria-busy=\"" + _0x1b36e4 + "\"" + (_0x1b36e4 ? " disabled" : "") + ">\n        " + (_0x1b36e4 ? "<span class=\"storyboard-script-loading-spinner person-replacement-export-spinner\" aria-hidden=\"true\"></span>" : "") + "<span>" + (_0x1b36e4 ? "导出中…" : "导出") + "</span>" + (_0x1b36e4 ? "" : "<span class=\"story-canvas-sync-chevron\" aria-hidden=\"true\"></span>") + "\n      </button>\n      <div class=\"story-canvas-sync-menu story-clip-export-menu\" role=\"menu\" aria-label=\"导出人物替换素材\" aria-hidden=\"true\">\n        <button type=\"button\" class=\"story-canvas-sync-option\" data-person-replacement-action=\"export-final-video\" role=\"menuitem\"" + (_0x1b36e4 ? " aria-disabled=\"true\" disabled" : "") + ">\n          <strong>导出完整视频（当前音轨）</strong><small>将完整替换画面与下方选择的音轨封装后导出</small>\n        </button>\n        <button type=\"button\" class=\"story-canvas-sync-option\" data-person-replacement-action=\"export-current-clip\" role=\"menuitem\"" + (_0x1b36e4 ? " aria-disabled=\"true\" disabled" : "") + ">\n          <strong>导出当前片段</strong><small>导出当前选中镜头的替换视频</small>\n        </button>\n        <button type=\"button\" class=\"story-canvas-sync-option\" data-person-replacement-action=\"export-all-replacement-clips\" role=\"menuitem\"" + (_0x1b36e4 ? " aria-disabled=\"true\" disabled" : "") + ">\n          <strong>导出所有替换片段/音频</strong><small>导出已有替换视频和替换音频，并跳过缺失项</small>\n        </button>\n        <button type=\"button\" class=\"story-canvas-sync-option\" data-person-replacement-action=\"export-all-clips-and-images\" role=\"menuitem\"" + (_0x1b36e4 ? " aria-disabled=\"true\" disabled" : "") + ">\n          <strong>导出所有片段/音频+替换图</strong><small>导出替换视频、替换音频及对应替换图</small>\n        </button>\n      </div>\n    </div>" : "";
  return "<div class=\"person-replacement-toolbar-actions" + (_0x16fe59 ? " person-replacement-preview-actions person-replacement-preview-actions--toolbar" : "") + "\">" + _0x232bc1 + _0x18065c + "</div>";
}
function renderHeader(_0x36b0da, _0x2abe7d = {}) {
  return "<header class=\"story-workspace-toolbar\"" + (_0x2abe7d.canvasSyncPending === true ? " aria-hidden=\"true\" inert" : "") + ">\n    <div class=\"story-project-toolbar person-replacement-story-toolbar\">\n      <button type=\"button\" class=\"story-toolbar-back\" data-person-replacement-action=\"back-home\" aria-label=\"返回人物替换项目\"><span class=\"story-toolbar-back-icon\" aria-hidden=\"true\"></span><span>人物替换项目</span></button>\n      " + renderStepNavigation(_0x36b0da) + "\n      <div class=\"person-replacement-toolbar-side\">" + renderProjectToolbarActions(_0x36b0da, _0x2abe7d) + "</div>\n    </div>\n  </header>";
}
function renderSourceQueue(_0xd35d8e) {
  if (!_0xd35d8e.sources.length) {
    return "";
  }
  return "<div class=\"person-replacement-import-queue\">\n    " + _0xd35d8e.sources.map((_0x23138d, _0x1da3d1) => {
    const _0x24f3f2 = _0x23138d.processingStatus === "uploading" ? "正在上传" : _0x23138d.processingStatus === "failed" ? "上传失败" : "已加入";
    const _0x5bcf0b = normalizeMediaUrl(_0x23138d.thumbnailRef);
    const _0x31afce = normalizeText(_0xd35d8e.sourcePreviewRefs?.[_0x23138d.id]);
    const _0x2a1b61 = normalizeMediaUrl(_0x31afce || _0x23138d.videoRef);
    const _0x319e2e = _0x23138d.fileName || "视频 " + (_0x1da3d1 + 1);
    return "<article class=\"person-replacement-import-item\">\n        <div class=\"person-replacement-import-thumbnail\">\n          " + (_0x5bcf0b ? "<img src=\"" + escapeHtml(_0x5bcf0b) + "\" alt=\"" + escapeHtml(_0x319e2e) + " 视频封面\" draggable=\"false\">" : _0x2a1b61 ? "<video src=\"" + escapeHtml(_0x2a1b61) + "\" preload=\"" + (_0x31afce ? "auto" : "metadata") + "\" muted playsinline aria-label=\"" + escapeHtml(_0x319e2e) + " 视频缩略图\" draggable=\"false\"></video>" : "<span class=\"person-replacement-import-placeholder\">" + renderVideoIcon() + "</span>") + "\n          <span class=\"person-replacement-import-status\">" + escapeHtml(_0x24f3f2) + "</span>\n          <button type=\"button\" class=\"person-replacement-import-remove\" data-person-replacement-action=\"remove-source\" data-source-id=\"" + escapeHtml(_0x23138d.id) + "\" aria-label=\"删除 " + escapeHtml(_0x319e2e) + "\">×</button>\n        </div>\n        <div class=\"person-replacement-import-copy\"><strong>" + escapeHtml(_0x319e2e) + "</strong><small>" + escapeHtml(_0x24f3f2) + "</small></div>\n      </article>";
  }).join("") + "\n  </div>";
}
function normalizeProjectTimestamp(_0x472919) {
  const _0x5ebc02 = Number(_0x472919);
  if (Number.isFinite(_0x5ebc02) && _0x5ebc02 > 0) {
    return _0x5ebc02;
  }
  const _0x4654f2 = Date.parse(_0x472919 || "");
  if (Number.isFinite(_0x4654f2)) {
    return _0x4654f2;
  } else {
    return 0;
  }
}
function buildPersonProjectHomeEntry(_0x55d751 = {}) {
  const _0x5c1826 = normalizeText(_0x55d751.id);
  const _0x5b61a1 = Array.isArray(_0x55d751.shots) ? _0x55d751.shots : [];
  return {
    id: _0x5c1826,
    title: normalizeText(_0x55d751.title, "未命名人物替换项目"),
    createdAt: normalizeProjectTimestamp(_0x55d751.createdAt),
    updatedAt: normalizeProjectTimestamp(_0x55d751.updatedAt),
    archivedAt: normalizeProjectTimestamp(_0x55d751.archivedAt),
    data: {
      project: {
        id: _0x5c1826,
        title: normalizeText(_0x55d751.title, "未命名人物替换项目")
      },
      episodes: _0x5b61a1
    },
    personReplacementProject: _0x55d751
  };
}
function getPersonProjectCoverImageUrls(_0x41db0e = {}) {
  return (Array.isArray(_0x41db0e.shots) ? _0x41db0e.shots : []).flatMap(_0x15c078 => [_0x15c078?.replacementImageRef, _0x15c078?.keyframeRef]).map(normalizeMediaUrl).filter((_0x42ba16, _0x274f20, _0x1216e) => _0x42ba16 && _0x1216e.indexOf(_0x42ba16) === _0x274f20).slice(0, 3);
}
function renderHome(_0x2bd65a) {
  const _0x4cf6ee = Array.isArray(_0x2bd65a.libraryProjects) ? _0x2bd65a.libraryProjects : [];
  const _0x5b63f1 = _0x4cf6ee.map(buildPersonProjectHomeEntry).filter(_0x12cf7b => _0x12cf7b.id);
  const _0xc604 = _0x2bd65a.workspace.showArchivedProjects === true;
  const _0x3d62ea = _0x5b63f1.filter(_0x26e5cf => _0x26e5cf.archivedAt > 0).length;
  const _0x39ed19 = getWorkspaceProjectHomeEntries(_0x5b63f1, {
    query: _0x2bd65a.workspace.projectSearchQuery,
    sortOrder: _0x2bd65a.workspace.projectSortOrder,
    showArchived: _0xc604
  });
  const _0x307736 = isPersonReplacementSourceProcessing(_0x2bd65a);
  const _0x285b49 = !_0x307736 && _0x2bd65a.sources.some(_0x911e27 => normalizeText(_0x911e27.videoRef));
  const _0x2b6ae5 = _0x307736 ? "" : renderSourceQueue(_0x2bd65a);
  const _0x317f57 = _0x307736 ? " disabled" : "";
  return "<main class=\"story-home-page\">\n    <section class=\"story-home-hero\">\n      <span class=\"story-eyebrow\">SHUO Canvas · " + REPLACEMENT_STUDIO_NAME + "</span>\n      <h1>完整替换视频中的人物与声音</h1>\n      <div class=\"story-home-composer\">\n        <div class=\"story-home-composer-body\">\n          <div class=\"story-home-composer-panel story-upload-drop person-replacement-video-drop " + (_0x2b6ae5 ? "has-sources" : "") + "\" data-person-replacement-video-drop>\n            " + (_0x2b6ae5 || "<strong>导入原始视频</strong>\n            <p>可一次选择或拖入一个或多个视频，导入后将在这里显示。</p>\n            <div class=\"story-upload-actions\"><button type=\"button\" class=\"story-secondary-button\" data-person-replacement-action=\"choose-source-videos\"" + _0x317f57 + ">选择视频</button></div>") + "\n          </div>\n        </div>\n        <div class=\"story-home-model-bar\">\n          <div class=\"story-home-model-controls person-replacement-home-source-controls\">\n            <button type=\"button\" class=\"story-secondary-button\" data-person-replacement-action=\"choose-source-videos\"" + _0x317f57 + ">加入视频</button>\n            <span class=\"person-replacement-home-flow-hint\">处理时切分镜头并抽帧检测；跳过时保留整段视频并抽帧检测。</span>\n          </div>\n          <div class=\"person-replacement-home-process-actions\">\n            <button type=\"button\" class=\"story-secondary-button\" data-person-replacement-action=\"process-sources\" data-processing-mode=\"skip\" " + (_0x285b49 ? "" : "disabled") + ">跳过处理</button>\n            " + renderSmartClipSettings(_0x2bd65a) + "\n            <button type=\"button\" class=\"story-primary-button story-home-generate\" data-person-replacement-action=\"process-sources\" data-processing-mode=\"cut\" " + (_0x285b49 ? "" : "disabled") + "><span>开始处理</span><span class=\"story-generate-arrow\" aria-hidden=\"true\">→</span></button>\n          </div>\n        </div>\n      </div>\n    </section>\n    <section class=\"story-projects-section\">\n      <div class=\"story-section-heading\">\n        <div><h2>" + (_0xc604 ? "已归档项目" : "我的人物替换项目") + "</h2></div>\n        <div class=\"story-project-list-controls\">\n          <label class=\"story-project-search\"><span aria-hidden=\"true\">⌕</span><input type=\"search\" data-story-project-search value=\"" + escapeHtml(_0x2bd65a.workspace.projectSearchQuery || "") + "\" placeholder=\"搜索项目名称\" autocomplete=\"off\" aria-label=\"搜索人物替换项目\"></label>\n          " + renderWorkspaceProjectSortControl(_0x2bd65a.workspace.projectSortOrder) + "\n          <button type=\"button\" class=\"story-project-archive-toggle " + (_0xc604 ? "is-active" : "") + "\" data-story-action=\"toggle-archived-projects\" aria-pressed=\"" + _0xc604 + "\">" + (_0xc604 ? "返回项目" : "已归档 " + _0x3d62ea) + "</button>\n        </div>\n      </div>\n      " + (_0x5b63f1.length ? "<div class=\"story-project-grid\">\n          " + _0x39ed19.map(_0x4417f1 => renderWorkspaceProjectCard(_0x4417f1, {
    isDeleteConfirming: _0x2bd65a.workspace.pendingDeleteProjectId === _0x4417f1.id,
    isMenuOpen: _0x2bd65a.workspace.openProjectMenuId === _0x4417f1.id,
    fallbackTitle: "未命名人物替换项目",
    itemCount: _0x4417f1.personReplacementProject?.shots?.length || 0,
    itemLabel: "个片段",
    coverImageUrls: getPersonProjectCoverImageUrls(_0x4417f1.personReplacementProject),
    emptyCoverLabel: "人物替换项目",
    coverAltPrefix: "人物替换项目封面",
    taskSummary: getPersonReplacementProjectTaskSummary(_0x4417f1.personReplacementProject)
  })).join("") + "\n          " + (_0x39ed19.length ? "" : "<div class=\"story-project-filter-empty\"><strong>" + (_0xc604 ? "没有匹配的归档项目" : "没有匹配的人物替换项目") + "</strong><span>可以尝试其他搜索词，或清空搜索条件。</span></div>") + "\n          " + (_0xc604 ? "" : "<button type=\"button\" class=\"story-project-create-tile\" data-person-replacement-action=\"choose-source-videos\" aria-label=\"新建人物替换项目\"><span aria-hidden=\"true\">+</span><strong>新建人物替换项目</strong></button>") + "\n        </div>" : "<div class=\"story-project-empty\">\n          <strong>还没有人物替换项目</strong>\n          <span>加入视频并开始处理后，项目会保存在当前用户项目数据中。</span>\n          <button type=\"button\" class=\"story-primary-button story-project-empty-action\" data-person-replacement-action=\"choose-source-videos\">创建第一个项目</button>\n        </div>") + "\n    </section>\n  </main>";
}
function renderStepFooter(_0x5c6d41, _0x52add9, {
  nextLabel = "下一步",
  hidePrevious = false
} = {}) {
  const _0x66636d = getPersonReplacementStepGate(_0x5c6d41, _0x5c6d41.workspace.step + 1);
  const _0x200082 = _0x5c6d41.workspace.step < PERSON_REPLACEMENT_STEPS.length && !_0x66636d.allowed;
  const _0x43170a = isPersonReplacementSourceProcessing(_0x5c6d41);
  const _0x5a8673 = _0x200082 || _0x43170a;
  const _0x4f75da = getStepGuidance(_0x5c6d41, _0x52add9);
  return "<footer class=\"story-page-footer person-replacement-step-footer\">\n    <div><strong data-person-replacement-guidance-role=\"footer-title\">" + escapeHtml(_0x4f75da.title) + "</strong><small data-person-replacement-guidance-role=\"footer-detail\">" + escapeHtml(_0x4f75da.detail) + "</small></div>\n    <div class=\"story-page-footer-actions\">\n      " + (hidePrevious ? "" : "<button type=\"button\" class=\"story-secondary-button\" data-person-replacement-action=\"previous-step\">上一步</button>") + "\n      <button type=\"button\" class=\"story-next-button" + (_0x43170a ? " is-processing" : _0x200082 ? " is-locked" : "") + "\" data-person-replacement-action=\"next-step\" aria-disabled=\"" + _0x5a8673 + "\" aria-busy=\"" + _0x43170a + "\"" + (_0x5a8673 ? " title=\"" + escapeHtml(_0x43170a ? "视频处理中，请稍候" : _0x66636d.message) + "\"" : "") + "><span>" + escapeHtml(nextLabel) + "</span><span class=\"story-next-arrow\" data-person-replacement-next-indicator=\"arrow\" aria-hidden=\"true\"" + (_0x43170a ? " hidden" : "") + ">→</span><span class=\"storyboard-script-loading-spinner person-replacement-step-next-spinner\" data-person-replacement-next-indicator=\"spinner\" aria-hidden=\"true\"" + (_0x43170a ? "" : " hidden") + "></span></button>\n    </div>\n  </footer>";
}
function renderCanvasSyncLoadingOverlay(_0x22283b = {}) {
  if (_0x22283b.canvasSyncPending !== true) {
    return "";
  }
  return "<div class=\"person-replacement-canvas-sync-loading storyboard-script-loading-overlay\" data-person-replacement-canvas-sync-loading role=\"status\" aria-live=\"polite\" aria-label=\"正在加入画布\" tabindex=\"-1\">\n    <span class=\"storyboard-script-loading-spinner person-replacement-canvas-sync-spinner person-replacement-canvas-sync-overlay-spinner\" aria-hidden=\"true\"></span>\n    <strong class=\"storyboard-script-loading-label\">正在加入画布</strong>\n    <small>同步完成后将自动跳转到画布</small>\n  </div>";
}
function createProjectTaskStatusElement(_0x115f7f, _0x1c7616, {
  className: _0x3c1e9e,
  dataAttribute: _0x596528
} = {}) {
  const _0x5e7b92 = _0x115f7f?.ownerDocument;
  if (!_0x5e7b92?.createElement || !_0x1c7616?.appendChild) {
    return null;
  }
  const _0x1ce136 = _0x5e7b92.createElement("span");
  _0x1ce136.className = _0x3c1e9e;
  _0x1ce136.setAttribute(_0x596528, "");
  _0x1c7616.appendChild(_0x1ce136);
  return _0x1ce136;
}
function syncStatus(_0x21e681, _0x3b0bbb, _0x4ce329) {
  if (!_0x21e681) {
    return;
  }
  const _0x29e5f5 = isPersonReplacementSourceProcessing(_0x3b0bbb);
  const _0xbc74cf = getStepGuidance(_0x3b0bbb, _0x4ce329);
  const _0x249e09 = _0x21e681.querySelector?.("[data-person-replacement-guidance-role=\"footer-title\"]");
  const _0x7972e0 = _0x21e681.querySelector?.("[data-person-replacement-guidance-role=\"footer-detail\"]");
  if (_0x249e09) {
    _0x249e09.textContent = _0xbc74cf.title;
  }
  if (_0x7972e0) {
    _0x7972e0.textContent = _0xbc74cf.detail;
  }
  const _0x4654f0 = _0x21e681.querySelector?.("[data-person-replacement-action=\"next-step\"]");
  if (_0x4654f0) {
    const _0x1c9686 = getPersonReplacementStepGate(_0x3b0bbb, _0x3b0bbb.workspace.step + 1);
    const _0x3a79a1 = _0x3b0bbb.workspace.step < PERSON_REPLACEMENT_STEPS.length && !_0x1c9686.allowed;
    const _0x3c62a4 = _0x3a79a1 || _0x29e5f5;
    _0x4654f0.classList?.toggle?.("is-locked", _0x3a79a1 && !_0x29e5f5);
    _0x4654f0.classList?.toggle?.("is-processing", _0x29e5f5);
    _0x4654f0.setAttribute?.("aria-disabled", String(_0x3c62a4));
    _0x4654f0.setAttribute?.("aria-busy", String(_0x29e5f5));
    if (_0x3c62a4) {
      _0x4654f0.setAttribute?.("title", _0x29e5f5 ? "视频处理中，请稍候" : _0x1c9686.message);
    } else {
      _0x4654f0.removeAttribute?.("title");
    }
  }
  const _0x4afa80 = _0x21e681.querySelector?.("[data-person-replacement-next-indicator=\"arrow\"]");
  const _0x334993 = _0x21e681.querySelector?.("[data-person-replacement-next-indicator=\"spinner\"]");
  if (_0x4afa80) {
    _0x4afa80.hidden = _0x29e5f5;
  }
  if (_0x334993) {
    _0x334993.hidden = !_0x29e5f5;
  }
  if (_0x3b0bbb.workspace.view !== "home") {
    return;
  }
  const _0x2fa63a = Array.from(_0x21e681.querySelectorAll?.("[data-workspace-open-project]") || []).find(_0xa9ee39 => normalizeText(_0xa9ee39?.dataset?.workspaceOpenProject) === normalizeText(_0x3b0bbb.id));
  if (!_0x2fa63a) {
    return;
  }
  let _0x5a36f3 = _0x2fa63a.querySelector?.("[data-workspace-project-status]");
  let _0xf9574c = _0x2fa63a.querySelector?.("[data-workspace-project-inline-status].has-task-error");
  const _0x55f347 = getPersonReplacementProjectTaskSummary(_0x3b0bbb);
  const _0x1b2f56 = _0x55f347.activeCount > 0;
  const _0x590718 = !_0x1b2f56 && _0x55f347.failedCount > 0;
  _0x2fa63a.classList?.toggle?.("is-generating", _0x1b2f56);
  _0x2fa63a.classList?.toggle?.("has-task-error", _0x590718);
  if (_0x1b2f56) {
    _0xf9574c?.remove?.();
    _0x5a36f3 ||= createProjectTaskStatusElement(_0x2fa63a, _0x2fa63a, {
      className: "story-project-status is-generating",
      dataAttribute: "data-workspace-project-status"
    });
    if (!_0x5a36f3) {
      return;
    }
    _0x5a36f3.classList?.add?.("is-generating");
    _0x5a36f3.textContent = _0x55f347.label;
    _0x5a36f3.setAttribute?.("role", "status");
    _0x5a36f3.setAttribute?.("aria-live", "polite");
    return;
  }
  _0x5a36f3?.remove?.();
  if (!_0x590718) {
    _0xf9574c?.remove?.();
    return;
  }
  const _0x274120 = _0x2fa63a.querySelector?.(".story-project-card-meta");
  _0xf9574c ||= createProjectTaskStatusElement(_0x2fa63a, _0x274120, {
    className: "story-project-inline-status has-task-error",
    dataAttribute: "data-workspace-project-inline-status"
  });
  if (!_0xf9574c) {
    return;
  }
  _0xf9574c.textContent = _0x55f347.label;
  _0xf9574c.setAttribute?.("role", "status");
  _0xf9574c.setAttribute?.("aria-live", "polite");
}
export function createPersonReplacementShellPresentation({
  resolveVoiceReferenceCount = () => 0
} = {}) {
  return Object.freeze({
    renderCanvasSyncLoadingOverlay: renderCanvasSyncLoadingOverlay,
    renderHeader: renderHeader,
    renderHome: renderHome,
    renderSmartClipSettingsPanel: renderSmartClipSettingsPanel,
    renderStepFooter: (_0x125b8c, _0x336ddb) => renderStepFooter(_0x125b8c, resolveVoiceReferenceCount, _0x336ddb),
    renderToolbarActions: renderProjectToolbarActions,
    syncStatus: (_0x5723e6, _0x2826b6) => syncStatus(_0x5723e6, _0x2826b6, resolveVoiceReferenceCount)
  });
}