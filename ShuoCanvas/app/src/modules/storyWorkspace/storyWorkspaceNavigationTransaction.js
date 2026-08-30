import { isStoryVideoReplicationAssetLocalizationComplete } from "./storyVideoReplication.js";
const STORY_WORKSPACE_STEP_COUNT = 3;
function normalizeText(_0x42300d) {
  return String(_0x42300d ?? "").trim();
}
function cloneNavigationValue(_0x3d3107, _0xc7385c) {
  if (_0x3d3107 === undefined) {
    return _0xc7385c;
  }
  try {
    return JSON.parse(JSON.stringify(_0x3d3107));
  } catch {
    return _0xc7385c;
  }
}
export function normalizeStoryWorkspaceStep(_0x155200) {
  const _0x55fe7b = Math.trunc(Number(_0x155200) || 1);
  return Math.max(1, Math.min(STORY_WORKSPACE_STEP_COUNT, _0x55fe7b));
}
export function canReuseStoryStepNavigation({
  view = "",
  hasNavigation = false,
  isEpisodeToolbar = false
} = {}) {
  return view === "project" && Boolean(hasNavigation) && !isEpisodeToolbar;
}
export function getStoryVideoEpisodes(_0x20a58b = []) {
  if (Array.isArray(_0x20a58b)) {
    return _0x20a58b.filter(_0x499ef5 => _0x499ef5 && normalizeText(_0x499ef5?.script?.fullText) !== "");
  } else {
    return [];
  }
}
function normalizeStoryWorkspaceProjectData(_0x5c4ee7) {
  if (_0x5c4ee7 && typeof _0x5c4ee7 === "object" && !Array.isArray(_0x5c4ee7)) {
    return _0x5c4ee7;
  } else {
    return {};
  }
}
export function getStoryWorkspaceStepBlockMessage(_0x13d4f6 = {}, _0x1d5a93 = 1) {
  const _0x10c896 = normalizeStoryWorkspaceStep(_0x1d5a93);
  if (_0x10c896 <= 1) {
    return "";
  }
  const _0x449dc3 = normalizeStoryWorkspaceProjectData(_0x13d4f6);
  if (!getStoryVideoEpisodes(_0x449dc3.episodes).length) {
    return "请先至少完成一集分集剧本正文。";
  }
  if (_0x449dc3.project?.sourceMode === "video-replication" && !isStoryVideoReplicationAssetLocalizationComplete(_0x449dc3)) {
    return "请先完成资产本地化。";
  }
  return "";
}
export function canEnterStoryWorkspaceStep(_0x1b25af = {}, _0xaa9b32 = 1) {
  return !getStoryWorkspaceStepBlockMessage(_0x1b25af, _0xaa9b32);
}
export function isStoryWorkspaceStepNavigationDisabled(_0x4debbc = {}, _0x39ac56 = 1) {
  const _0x1ff25a = normalizeStoryWorkspaceStep(_0x39ac56);
  const _0x3d9907 = normalizeStoryWorkspaceProjectData(_0x4debbc);
  return _0x1ff25a > 1 && (_0x3d9907.project?.outlineStatus === "stale" || !canEnterStoryWorkspaceStep(_0x3d9907, _0x1ff25a));
}
export function getStoryWorkspaceTransitionDirection(_0x1349bd, _0x320b6a) {
  const _0x39fe22 = normalizeStoryWorkspaceStep(_0x1349bd);
  const _0x47612d = normalizeStoryWorkspaceStep(_0x320b6a);
  if (_0x39fe22 === _0x47612d) {
    return "none";
  }
  if (_0x47612d > _0x39fe22) {
    return "forward";
  } else {
    return "backward";
  }
}
export function getStoryWorkspacePageTransitionDirection(_0x1cc6d, _0x35c67f, _0x4e9ca4) {
  if (normalizeText(_0x1cc6d) === "episode") {
    return "backward";
  }
  return getStoryWorkspaceTransitionDirection(_0x35c67f, _0x4e9ca4);
}
export function getStoryEpisodeGenerationControlState(_0x2ca7e6 = {}, _0x46eb2c = "") {
  const _0x381bc6 = normalizeText(_0x46eb2c);
  const _0x1ccdd0 = (Array.isArray(_0x2ca7e6.splittingEpisodeIds) ? _0x2ca7e6.splittingEpisodeIds : []).some(_0x597716 => normalizeText(_0x597716) === _0x381bc6);
  const _0x215e3c = normalizeText(_0x2ca7e6.storyPlanningOperation);
  const _0x33e68c = Boolean(_0x215e3c && _0x215e3c !== "splitting-episode");
  return {
    isGenerating: _0x1ccdd0,
    disabled: _0x1ccdd0 || _0x33e68c
  };
}
function captureNavigationSnapshot(_0x16706e) {
  return {
    view: _0x16706e.view,
    step: _0x16706e.step,
    selectedEpisodeId: _0x16706e.selectedEpisodeId,
    selectedClipId: _0x16706e.selectedClipId,
    episodeSelectionMode: _0x16706e.episodeSelectionMode,
    selectedEpisodeIds: [...(_0x16706e.selectedEpisodeIds || [])],
    clipSelectionMode: _0x16706e.clipSelectionMode,
    selectedClipGenerationIds: [...(_0x16706e.selectedClipGenerationIds || [])],
    characterVoicePanelMotion: _0x16706e.characterVoicePanelMotion,
    pendingCharacterVoiceAssetId: _0x16706e.pendingCharacterVoiceAssetId,
    pendingDeleteClipId: _0x16706e.pendingDeleteClipId,
    selectedAssetId: _0x16706e.selectedAssetId,
    assetFilter: _0x16706e.assetFilter,
    assetSelectionMode: _0x16706e.assetSelectionMode,
    selectedAssetIds: [...(_0x16706e.selectedAssetIds || [])],
    characterVoiceEditor: cloneNavigationValue(_0x16706e.characterVoiceEditor, null),
    outlineSectionOpenState: cloneNavigationValue(_0x16706e.outlineSectionOpenState || {}, {}),
    clipAdjustmentOpen: _0x16706e.clipAdjustmentOpen,
    clipAdjustmentInstruction: _0x16706e.clipAdjustmentInstruction,
    clipPromptHistoryOpen: _0x16706e.clipPromptHistoryOpen,
    models: {
      ...(_0x16706e.models || {})
    },
    videoProvider: _0x16706e.videoProvider,
    videoProviderProfileId: _0x16706e.videoProviderProfileId,
    videoProviderProfileIdByModel: cloneNavigationValue(_0x16706e.videoProviderProfileIdByModel || {}, {}),
    videoGenerationParams: {
      ...(_0x16706e.videoGenerationParams || {})
    },
    videoGenerationParamsByModel: cloneNavigationValue(_0x16706e.videoGenerationParamsByModel || {}, {})
  };
}
function restoreNavigationSnapshot(_0x199b04, _0x5e646b) {
  Object.assign(_0x199b04, _0x5e646b);
}
export function createStoryWorkspaceNavigationTransaction({
  state: _0x195b3a,
  toolbarEl = null,
  windowObject = globalThis.window,
  renderAdapter = {},
  onClipSelected = () => {},
  onCommit = () => {},
  notify = () => {},
  logger = globalThis.console
} = {}) {
  if (!_0x195b3a || typeof _0x195b3a !== "object") {
    throw new Error("[storyWorkspaceNavigation] state is required");
  }
  if (typeof renderAdapter.render !== "function") {
    throw new Error("[storyWorkspaceNavigation] renderAdapter.render is required");
  }
  let _0x20b85a = 0;
  let _0x263bbb = false;
  let _0x2f6a33 = null;
  function _0x1b6cbf({
    restore = true
  } = {}) {
    const _0x3d0820 = _0x2f6a33;
    if (!_0x3d0820) {
      return;
    }
    _0x3d0820.cancelWait?.();
    if (restore) {
      restoreNavigationSnapshot(_0x195b3a, _0x3d0820.snapshot);
    }
    if (_0x2f6a33 === _0x3d0820) {
      _0x2f6a33 = null;
    }
    _0x2d1695();
  }
  function _0x347d4e() {
    const _0x2f0e5a = ++_0x20b85a;
    _0x1b6cbf();
    const _0x4980c3 = captureNavigationSnapshot(_0x195b3a);
    _0x2f6a33 = {
      token: _0x2f0e5a,
      snapshot: _0x4980c3,
      cancelWait: null
    };
    return {
      token: _0x2f0e5a,
      snapshot: _0x4980c3
    };
  }
  function _0x3e6c05(_0x35bd31) {
    if (_0x2f6a33?.token === _0x35bd31) {
      _0x2f6a33 = null;
    }
  }
  function _0x2d4a1b() {
    const _0x43fa1a = toolbarEl?.querySelector?.(".story-step-navigation");
    const _0xd019ad = toolbarEl?.querySelector?.(".story-project-toolbar");
    const _0x392180 = canReuseStoryStepNavigation({
      view: _0x195b3a.view,
      hasNavigation: Boolean(_0x43fa1a),
      isEpisodeToolbar: Boolean(_0xd019ad?.classList?.contains("story-project-toolbar--episode"))
    });
    if (!_0x392180) {
      return false;
    }
    _0x43fa1a.dataset.activeStep = String(_0x195b3a.step);
    _0x43fa1a.querySelectorAll("[data-story-step]").forEach(_0x15192d => {
      const _0x26c3c0 = normalizeStoryWorkspaceStep(_0x15192d.dataset.storyStep);
      const _0x5d4080 = _0x26c3c0 === _0x195b3a.step;
      _0x15192d.classList.toggle("is-active", _0x5d4080);
      _0x15192d.setAttribute("aria-current", _0x5d4080 ? "step" : "false");
      _0x15192d.disabled = isStoryWorkspaceStepNavigationDisabled(_0x195b3a.data, _0x26c3c0);
    });
    return true;
  }
  function _0x15db70(_0xf885d1) {
    const _0x18d838 = toolbarEl?.querySelector?.(".story-project-toolbar--episode");
    const _0x513227 = _0x18d838?.querySelector(".story-episode-toolbar-current");
    const _0xa842bc = _0x18d838?.querySelector("[data-story-step=\"" + normalizeStoryWorkspaceStep(_0xf885d1) + "\"]");
    if (!_0x18d838 || !_0x513227 || !_0xa842bc) {
      return false;
    }
    const _0x365ee6 = _0x513227.getBoundingClientRect?.();
    const _0x345e29 = _0xa842bc.getBoundingClientRect?.();
    if (!_0x365ee6?.width || !_0x345e29?.width) {
      return false;
    }
    _0x513227.style.setProperty("--story-episode-exit-x", _0x345e29.left - _0x365ee6.left + "px");
    _0x513227.style.setProperty("--story-episode-exit-width", _0x345e29.width + "px");
    _0xa842bc.classList.add("is-episode-exit-target");
    _0x18d838.classList.add("is-switching-from-episode");
    return true;
  }
  function _0x2dd0bb() {
    const _0x1cc798 = toolbarEl?.querySelector?.(".story-project-toolbar:not(.story-project-toolbar--episode)");
    const _0x1513a2 = _0x1cc798?.querySelector(".story-episode-toolbar-current[data-story-episode-state=\"inactive\"]");
    const _0x318fa5 = _0x1cc798?.querySelector("[data-story-step=\"" + normalizeStoryWorkspaceStep(_0x195b3a.step) + "\"]");
    if (!_0x1cc798 || !_0x1513a2 || !_0x318fa5) {
      return false;
    }
    const _0xbe8cd8 = _0x1513a2.getBoundingClientRect?.();
    const _0x4f5f21 = _0x318fa5.getBoundingClientRect?.();
    if (!_0xbe8cd8?.width || !_0x4f5f21?.width) {
      return false;
    }
    _0x1513a2.style.setProperty("--story-episode-enter-x", _0x4f5f21.left - _0xbe8cd8.left + "px");
    _0x1513a2.style.setProperty("--story-episode-enter-width", _0x4f5f21.width + "px");
    _0x1cc798.classList.add("is-switching-to-episode");
    _0x1513a2.getBoundingClientRect?.();
    windowObject?.requestAnimationFrame?.(() => {
      if (!_0x1cc798.isConnected || !_0x1cc798.classList.contains("is-switching-to-episode")) {
        return;
      }
      _0x1cc798.classList.add("is-switching-to-episode-ready");
    });
    return true;
  }
  function _0x2d1695() {
    toolbarEl?.querySelectorAll?.(".story-project-toolbar").forEach(_0x2ee8e0 => {
      _0x2ee8e0.classList.remove("is-switching-to-episode", "is-switching-to-episode-ready", "is-switching-from-episode");
    });
    toolbarEl?.querySelectorAll?.(".story-episode-toolbar-current").forEach(_0x1c5554 => {
      _0x1c5554.style.removeProperty("--story-episode-enter-x");
      _0x1c5554.style.removeProperty("--story-episode-enter-width");
      _0x1c5554.style.removeProperty("--story-episode-exit-x");
      _0x1c5554.style.removeProperty("--story-episode-exit-width");
    });
    toolbarEl?.querySelectorAll?.(".is-episode-exit-target").forEach(_0x3a58f9 => {
      _0x3a58f9.classList.remove("is-episode-exit-target");
    });
  }
  function _0x247582(_0x4d46ac) {
    if (typeof windowObject?.requestAnimationFrame !== "function") {
      return Promise.resolve();
    }
    return new Promise(_0x11843f => {
      const _0x3354f7 = _0x2f6a33?.token === _0x4d46ac ? _0x2f6a33 : null;
      if (!_0x3354f7) {
        _0x11843f();
        return;
      }
      let _0xfcf259 = 0;
      let _0x3c9025 = 0;
      let _0x4f396e = false;
      const _0x5a3237 = () => {
        if (_0x4f396e) {
          return;
        }
        _0x4f396e = true;
        if (_0x3354f7.cancelWait === _0x2c80f8) {
          _0x3354f7.cancelWait = null;
        }
        _0x11843f();
      };
      const _0x2c80f8 = () => {
        if (typeof windowObject.cancelAnimationFrame === "function") {
          if (_0xfcf259) {
            windowObject.cancelAnimationFrame(_0xfcf259);
          }
          if (_0x3c9025) {
            windowObject.cancelAnimationFrame(_0x3c9025);
          }
        }
        _0x5a3237();
      };
      _0x3354f7.cancelWait = _0x2c80f8;
      _0xfcf259 = windowObject.requestAnimationFrame(() => {
        _0xfcf259 = 0;
        _0x3c9025 = windowObject.requestAnimationFrame(() => {
          _0x3c9025 = 0;
          _0x5a3237();
        });
      });
    });
  }
  function _0x39f90d({
    token: _0x4e3499,
    snapshot: _0x1c04ee,
    operation: _0x314ab0,
    error: _0x407a02,
    message: _0x1293f5
  }) {
    if (_0x263bbb || _0x4e3499 !== _0x20b85a) {
      return false;
    }
    restoreNavigationSnapshot(_0x195b3a, _0x1c04ee);
    if (_0x2f6a33?.token === _0x4e3499) {
      _0x2f6a33 = null;
    }
    _0x2d1695();
    logger?.error?.("[storyWorkspace][" + _0x314ab0 + "] 导航失败", _0x407a02);
    try {
      renderAdapter.renderToolbar?.();
    } catch (_0x4b3a9b) {
      logger?.error?.("[storyWorkspace][" + _0x314ab0 + "] 工具栏恢复失败", _0x4b3a9b);
    }
    try {
      renderAdapter.render({
        direction: "none",
        updateToolbar: false,
        capturePageState: false
      });
    } catch (_0x589227) {
      logger?.error?.("[storyWorkspace][" + _0x314ab0 + "] 页面恢复失败", _0x589227);
    }
    notify(_0x1293f5, "error");
    return false;
  }
  function _0xaad52(_0x2f0084, _0x3337b0) {
    if (_0x263bbb || _0x2f0084 !== _0x20b85a) {
      return;
    }
    try {
      renderAdapter.renderToolbar?.();
    } catch (_0x303844) {
      logger?.error?.("[storyWorkspace][" + _0x3337b0 + "] 工具栏收尾失败", _0x303844);
      notify("工具栏更新失败，请重试。", "error");
      throw _0x303844;
    } finally {
      _0x2d1695();
    }
  }
  async function _0x242376(_0x41c75a = {}) {
    if (_0x263bbb) {
      return false;
    }
    const _0x6f8f22 = normalizeStoryWorkspaceStep(_0x41c75a.step);
    const _0x529fe6 = getStoryWorkspaceStepBlockMessage(_0x195b3a.data, _0x6f8f22);
    if (_0x529fe6) {
      notify(_0x529fe6, "warn");
      return false;
    }
    const {
      token: _0x3c2796,
      snapshot: _0x291c0f
    } = _0x347d4e();
    try {
      const _0x26a401 = _0x195b3a.view === "episode";
      const _0x582fb5 = getStoryWorkspacePageTransitionDirection(_0x195b3a.view, _0x195b3a.step, _0x6f8f22);
      if (_0x26a401) {
        _0x15db70(_0x6f8f22);
      }
      if (_0x6f8f22 !== _0x195b3a.step) {
        _0x195b3a.episodeSelectionMode = false;
        _0x195b3a.selectedEpisodeIds = [];
        _0x195b3a.clipSelectionMode = false;
        _0x195b3a.selectedClipGenerationIds = [];
        _0x195b3a.characterVoicePanelMotion = "";
        _0x195b3a.pendingCharacterVoiceAssetId = "";
      }
      _0x195b3a.pendingDeleteClipId = "";
      _0x195b3a.view = "project";
      _0x195b3a.step = _0x6f8f22;
      if (normalizeText(_0x41c75a.assetFilter)) {
        _0x195b3a.assetFilter = normalizeText(_0x41c75a.assetFilter);
      }
      if (normalizeText(_0x41c75a.assetId)) {
        _0x195b3a.selectedAssetId = normalizeText(_0x41c75a.assetId);
        _0x195b3a.characterVoiceEditor = null;
        _0x195b3a.characterVoicePanelMotion = "";
        _0x195b3a.pendingCharacterVoiceAssetId = "";
      }
      if (normalizeText(_0x41c75a.outlineSectionId)) {
        const _0x37993a = normalizeText(_0x41c75a.outlineSectionId);
        _0x195b3a.outlineSectionOpenState = {
          ...(_0x195b3a.outlineSectionOpenState || {}),
          ...(_0x37993a.startsWith("episode-") ? {
            episodes: true
          } : {}),
          [_0x37993a]: true
        };
      }
      if (_0x6f8f22 === 2) {
        const _0x68453c = (_0x195b3a.data?.assets || []).some(_0x3bd289 => normalizeText(_0x3bd289?.id) === normalizeText(_0x195b3a.selectedAssetId) && _0x3bd289?.kind === _0x195b3a.assetFilter);
        if (!_0x68453c) {
          const _0x54e7e4 = (_0x195b3a.data?.assets || []).find(_0x4fc826 => _0x4fc826.kind === _0x195b3a.assetFilter);
          _0x195b3a.selectedAssetId = _0x54e7e4?.id || "";
        }
        _0x195b3a.assetSelectionMode = false;
        _0x195b3a.selectedAssetIds = [];
      }
      const _0x1d56a0 = _0x26a401 ? false : _0x2d4a1b();
      const _0x1d7314 = await Promise.resolve(renderAdapter.render({
        direction: _0x582fb5,
        updateToolbar: !_0x26a401 && !_0x1d56a0,
        onTransitionComplete: _0x26a401 ? () => _0xaad52(_0x3c2796, "go-to-step") : null
      }));
      if (_0x263bbb || _0x3c2796 !== _0x20b85a) {
        return false;
      }
      if (_0x1d7314 !== true) {
        throw new Error("story workspace page transition was interrupted");
      }
      onCommit();
      _0x3e6c05(_0x3c2796);
      return true;
    } catch (_0x353dda) {
      return _0x39f90d({
        token: _0x3c2796,
        snapshot: _0x291c0f,
        operation: "go-to-step",
        error: _0x353dda,
        message: "切换步骤失败，请重试。"
      });
    }
  }
  async function _0x3ffaef(_0x4e1226, _0x39516b = "") {
    if (_0x263bbb) {
      return false;
    }
    const _0x17f3ed = getStoryWorkspaceStepBlockMessage(_0x195b3a.data, 3);
    if (_0x17f3ed) {
      notify(_0x17f3ed, "warn");
      return false;
    }
    const _0x2e1cbc = (_0x195b3a.data?.episodes || []).find(_0x19e82d => normalizeText(_0x19e82d?.id) === normalizeText(_0x4e1226));
    if (!_0x2e1cbc) {
      return false;
    }
    if (getStoryEpisodeGenerationControlState(_0x195b3a, _0x2e1cbc.id).disabled) {
      return false;
    }
    if (!Array.isArray(_0x2e1cbc.clips) || !_0x2e1cbc.clips.length) {
      return false;
    }
    const {
      token: _0x5348ff,
      snapshot: _0x5336c4
    } = _0x347d4e();
    try {
      const _0x40ec2d = _0x195b3a.view !== "episode";
      const _0x2c03da = _0x195b3a.view === "episode" && _0x195b3a.selectedEpisodeId !== _0x2e1cbc.id;
      renderAdapter.capturePageState?.();
      _0x195b3a.clipAdjustmentOpen = false;
      _0x195b3a.clipAdjustmentInstruction = "";
      _0x195b3a.clipPromptHistoryOpen = false;
      _0x195b3a.selectedEpisodeId = _0x2e1cbc.id;
      const _0x2c87b3 = _0x2e1cbc.clips.find(_0x594289 => normalizeText(_0x594289?.id) === normalizeText(_0x39516b)) || _0x2e1cbc.clips[0];
      _0x195b3a.selectedClipId = _0x2c87b3?.id || "";
      _0x195b3a.pendingDeleteClipId = "";
      _0x195b3a.clipSelectionMode = false;
      _0x195b3a.selectedClipGenerationIds = [];
      onClipSelected(_0x2c87b3, {
        episode: _0x2e1cbc,
        enteringEpisode: _0x40ec2d,
        switchingEpisode: _0x2c03da
      });
      if (_0x2c03da) {
        renderAdapter.renderToolbar?.();
        await _0x247582(_0x5348ff);
        if (_0x5348ff !== _0x20b85a) {
          return false;
        }
        if (_0x195b3a.view !== "episode" || _0x195b3a.selectedEpisodeId !== _0x2e1cbc.id) {
          throw new Error("story episode navigation was superseded");
        }
      }
      let _0x3eba77 = false;
      if (_0x40ec2d) {
        renderAdapter.renderToolbar?.();
        _0x3eba77 = _0x2dd0bb();
      }
      _0x195b3a.view = "episode";
      const _0xe257c = await Promise.resolve(renderAdapter.render({
        direction: "forward",
        updateToolbar: !_0x3eba77 && !_0x2c03da,
        capturePageState: false,
        onTransitionComplete: _0x3eba77 ? () => _0xaad52(_0x5348ff, "open-episode") : null
      }));
      if (_0x263bbb || _0x5348ff !== _0x20b85a) {
        return false;
      }
      if (_0xe257c !== true) {
        throw new Error("story workspace page transition was interrupted");
      }
      onCommit();
      _0x3e6c05(_0x5348ff);
      return true;
    } catch (_0xc0f422) {
      return _0x39f90d({
        token: _0x5348ff,
        snapshot: _0x5336c4,
        operation: "open-episode",
        error: _0xc0f422,
        message: "打开分集失败，请重试。"
      });
    }
  }
  function _0x46ce59(_0x1362db = {}) {
    if (normalizeText(_0x1362db.view) === "episode") {
      return _0x3ffaef(_0x1362db.episodeId, _0x1362db.clipId);
    }
    if (normalizeText(_0x1362db.view) === "project") {
      return _0x242376(_0x1362db);
    }
    return Promise.resolve(false);
  }
  function _0x51dadb() {
    _0x1b6cbf();
    _0x263bbb = true;
    _0x20b85a += 1;
    _0x2d1695();
  }
  return {
    navigate: _0x46ce59,
    destroy: _0x51dadb
  };
}