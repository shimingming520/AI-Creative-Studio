import a607_0x1e769c from "../core/stores/appStore.js";
import { commit } from "../modules/history.js";
import { startNodeResizePreview } from "../modules/interaction/nodeResizePreview.js";
import { openExternalLink } from "../services/externalLinkService.js";
import { registerWebPreviewSlot } from "../services/webPreviewViewSyncService.js";
import { desktopBridge } from "../services/desktopBridge.js";
import { clampWebPreviewNodeSize } from "../modules/webPreviewSizing.js";
import { activateWebPreviewTabData, addWebPreviewTabData, closeWebPreviewTabData, getWebPreviewActiveTabUrl, normalizeWebPreviewTabs, updateWebPreviewTabFaviconData, updateWebPreviewTabUrlData } from "../modules/webPreviewTabs.js";
import { normalizeWebPreviewAddressInput, normalizeWebPreviewUrl } from "../modules/webPreviewUrl.js";
import { createWebReferenceCardNode, createWebPreviewImagePromptNodeFromSelection, createWebPreviewImageNodeFromContext, createWebPreviewReverseImagePromptNodes, createWebPreviewSourceTextNodeFromSelection, createWebPreviewTextNodeFromSelection, createWebPreviewVideoPromptNodeFromSelection, openWebPreviewMediaPicker } from "../modules/webPreviewCaptureFlow.js";
import { recordWebPreviewVisit } from "../services/webPreviewStartPageService.js";
import { createWebPreviewRemoteInputQueue } from "../services/webPreviewRemoteInputQueue.js";
import { WebPreviewStartPageView } from "./webPreview/WebPreviewStartPageView.js";
import { WebPreviewTabBarView } from "./webPreview/WebPreviewTabBarView.js";
import { createWebPreviewToolbar } from "./webPreview/WebPreviewToolbarView.js";
import { getWebPreviewDefaultStatusText } from "./webPreview/webPreviewConstants.js";
import { onLocaleChange, t } from "../i18n/index.js";
function webPreviewText(_0x11adb2, _0x556faa = {}) {
  return t("webPreview." + _0x11adb2, _0x556faa);
}
const WEB_PREVIEW_REVERSE_PROMPT_GENERATE_EVENT = "reverse-image-prompt-generate";
const WEB_PREVIEW_TEXT_SOURCE_EVENT = "send-selected-text-source";
const WEB_PREVIEW_TEXT_IMAGE_PROMPT_EVENT = "send-selected-text-to-image";
const WEB_PREVIEW_TEXT_IMAGE_PROMPT_GENERATE_EVENT = "send-selected-text-to-image-generate";
const WEB_PREVIEW_TEXT_VIDEO_PROMPT_EVENT = "send-selected-text-to-video";
const WEB_PREVIEW_TEXT_VIDEO_PROMPT_GENERATE_EVENT = "send-selected-text-to-video-generate";
const WEB_PREVIEW_REVERSE_PROMPT_MOUNT_ATTEMPTS = 30;
const WEB_PREVIEW_REVERSE_PROMPT_MOUNT_DELAY_MS = 16;
function dispatchWebPreviewForceSync(_0x5dfbe2) {
  globalThis.window?.dispatchEvent?.(new CustomEvent("web-preview:force-sync", {
    detail: {
      nodeId: _0x5dfbe2
    }
  }));
}
function waitForNextFrame() {
  return new Promise(_0x6d55c => {
    const _0x582d9d = globalThis.window;
    if (typeof _0x582d9d?.requestAnimationFrame === "function") {
      _0x582d9d.requestAnimationFrame(() => _0x6d55c());
      return;
    }
    if (typeof globalThis.requestAnimationFrame === "function") {
      globalThis.requestAnimationFrame(() => _0x6d55c());
      return;
    }
    if (typeof globalThis.setTimeout === "function") {
      globalThis.setTimeout(_0x6d55c, WEB_PREVIEW_REVERSE_PROMPT_MOUNT_DELAY_MS);
      return;
    }
    _0x6d55c();
  });
}
function isCanvasNodeMounted(_0x3a1776) {
  const _0x382486 = String(_0x3a1776 || "").trim();
  if (_0x382486) {
    return globalThis.window?.v2Renderer?.isNodeMounted?.(_0x382486) === true;
  } else {
    return false;
  }
}
async function waitForMountedCanvasNode(_0x52a304) {
  for (let _0x1a7c08 = 0; _0x1a7c08 < WEB_PREVIEW_REVERSE_PROMPT_MOUNT_ATTEMPTS; _0x1a7c08 += 1) {
    if (isCanvasNodeMounted(_0x52a304)) {
      return true;
    }
    await waitForNextFrame();
  }
  return false;
}
function getCanvasCommandFailureText(_0x2d2b05) {
  return String(_0x2d2b05?.message || _0x2d2b05?.errorCode || _0x2d2b05?.error || webPreviewText("toasts.reversePromptGenerateUnavailable"));
}
function getPendingVisitKey(_0xbd9cfb, _0x2023ae) {
  return (_0xbd9cfb || "") + "\n" + (_0x2023ae || "");
}
export function commitWebPreviewNodeUrl({
  nodeId: _0x8fc6e5,
  rawUrl: _0x4d1829,
  title = "",
  storeInstance = a607_0x1e769c,
  commitFn = commit,
  showToast = globalThis.window?.showToast,
  recordVisitFn = recordWebPreviewVisit,
  tabId = "",
  nodeData = null
} = {}) {
  const _0x5f56fd = normalizeWebPreviewAddressInput(_0x4d1829);
  if (!_0x5f56fd) {
    showToast?.(webPreviewText("toasts.addressRequired"), "warning");
    return {
      ok: false,
      error: "invalid-url"
    };
  }
  if (!_0x8fc6e5 || typeof storeInstance?.updateNodeData !== "function") {
    return {
      ok: false,
      error: "missing-node"
    };
  }
  const _0x5685d2 = nodeData || storeInstance.getStateRaw?.()?.nodes?.[_0x8fc6e5] || storeInstance.getState?.()?.nodes?.[_0x8fc6e5] || {
    id: _0x8fc6e5,
    type: "web-preview",
    webUrl: ""
  };
  const _0x39bac8 = updateWebPreviewTabUrlData(_0x5685d2, {
    tabId: tabId,
    url: _0x5f56fd,
    title: title
  });
  if (_0x39bac8.ok === false) {
    return {
      ok: false,
      error: _0x39bac8.error || "missing-tab"
    };
  }
  const _0x7d486b = {
    ..._0x39bac8.patch,
    name: webPreviewText("nodeName")
  };
  storeInstance.updateNodeData(_0x8fc6e5, {
    ..._0x7d486b
  });
  recordVisitFn?.({
    url: _0x5f56fd,
    title: title
  });
  commitFn?.();
  dispatchWebPreviewForceSync(_0x8fc6e5);
  return {
    ok: true,
    url: _0x5f56fd,
    tabId: _0x39bac8.tabId,
    patch: _0x7d486b
  };
}
export class WebPreviewNode {
  constructor(_0x2b1e28) {
    this._data = _0x2b1e28;
    this.id = _0x2b1e28.id;
    this.el = document.createElement("div");
    this.el.className = "v2-node-component web-preview-component";
    this._statusText = getWebPreviewDefaultStatusText();
    this._unsubscribeNativeEvent = null;
    this._unsubscribeLocale = null;
    this._navigationState = {
      canGoBack: false,
      canGoForward: false
    };
    this._navigationStateByTabId = new Map();
    this._backButtons = [];
    this._forwardButtons = [];
    this._fullscreenOverlay = null;
    this._fullscreenInput = null;
    this._fullscreenTabBar = null;
    this._fullscreenSlot = null;
    this._freezeLayer = null;
    this._freezeImage = null;
    this._freezeSnapshotSerial = 0;
    this._fullscreenKeyHandler = null;
    this._unregisterSlot = null;
    this._unregisterFullscreenSlot = null;
    this._toolbar = null;
    this._fullscreenToolbar = null;
    this._tabBar = null;
    this._startPageView = null;
    this._pendingVisitTitles = new Map();
    this._remoteWheelTimer = null;
    this._remoteWheelInput = null;
    this._remoteInputQueue = createWebPreviewRemoteInputQueue({
      send: _0x2135fe => {
        if (!this._isRemoteBrowserSurface()) {
          return Promise.resolve();
        }
        if (!desktopBridge.webPreview.isAvailable()) {
          return Promise.resolve();
        }
        return Promise.resolve(desktopBridge.webPreview.controlView({
          nodeId: this.id,
          tabId: this._getActiveTabId(),
          action: "dispatch-input",
          input: _0x2135fe
        }));
      }
    });
  }
  mount() {
    const _0x36bc20 = document.createElement("div");
    _0x36bc20.className = "node-card web-preview-card";
    _0x36bc20.addEventListener("dblclick", _0x20668a => _0x20668a.stopPropagation());
    const _0x42baa7 = createWebPreviewToolbar({
      className: "web-preview-header",
      url: this._getActiveUrl(),
      onSubmit: _0x882ee6 => this._commitUrl(_0x882ee6),
      onBack: () => this._navigate("back"),
      onForward: () => this._navigate("forward"),
      onRefresh: () => this._refresh(),
      onExtractMedia: () => this._extractMedia(),
      onSaveReference: () => this._saveReferenceCard(),
      onExternal: () => this._openExternal(),
      onFullscreen: () => this._openFullscreen()
    });
    const _0x2515cc = this._createTabBarView();
    const _0x54a2c9 = document.createElement("div");
    _0x54a2c9.className = "web-preview-body";
    _0x54a2c9.dataset.webPreviewSlot = "true";
    _0x54a2c9.dataset.nodeId = this.id;
    _0x54a2c9.dataset.tabId = this._getActiveTabId();
    _0x54a2c9.dataset.webUrl = this._getActiveUrl();
    _0x54a2c9.addEventListener("pointerdown", _0x4e3cdb => {
      const _0x5cf152 = this._getTabState().activeTab;
      if (this._getActiveUrl() || _0x5cf152?.pendingPopup === true) {
        this._requestLiveWebView();
        _0x4e3cdb.stopPropagation();
      }
    });
    const _0x71e0fb = new WebPreviewStartPageView({
      statusText: getWebPreviewDefaultStatusText(),
      onOpenUrl: (_0x2c022f, _0x34d43f) => this._commitUrl(_0x2c022f, _0x34d43f)
    });
    const _0x35c0cf = _0x71e0fb.mount();
    _0x54a2c9.appendChild(_0x35c0cf);
    const _0x61e112 = document.createElement("div");
    _0x61e112.className = "web-preview-freeze-layer";
    const _0x9aaf20 = document.createElement("img");
    _0x9aaf20.className = "web-preview-freeze-image";
    _0x9aaf20.alt = "";
    _0x61e112.appendChild(_0x9aaf20);
    _0x61e112.tabIndex = 0;
    _0x61e112.addEventListener("pointerdown", _0xdf2da6 => {
      this._handleRemotePointerInput("mousePressed", _0xdf2da6);
    });
    _0x61e112.addEventListener("pointerup", _0x23f0b3 => {
      this._handleRemotePointerInput("mouseReleased", _0x23f0b3);
    });
    _0x61e112.addEventListener("pointermove", _0x5f1fe4 => {
      this._handleRemotePointerMoveInput(_0x5f1fe4);
    });
    _0x61e112.addEventListener("pointercancel", _0xed132e => {
      this._handleRemotePointerInput("mouseReleased", _0xed132e);
    });
    _0x61e112.addEventListener("wheel", _0x22f677 => {
      this._handleRemoteWheelInput(_0x22f677);
    }, {
      passive: false
    });
    _0x61e112.addEventListener("keydown", _0x2d2eaa => {
      this._handleRemoteKeyInput("keyDown", _0x2d2eaa);
    });
    _0x61e112.addEventListener("keyup", _0x544f1d => {
      this._handleRemoteKeyInput("keyUp", _0x544f1d);
    });
    _0x61e112.addEventListener("contextmenu", _0x5c12a9 => {
      if (!this._isRemoteBrowserSurface()) {
        return;
      }
      _0x5c12a9.preventDefault();
      _0x5c12a9.stopPropagation();
    });
    _0x54a2c9.appendChild(_0x61e112);
    const _0x42b7ba = document.createElement("div");
    _0x42b7ba.className = "web-preview-status";
    _0x42b7ba.textContent = getWebPreviewDefaultStatusText();
    const _0x180fff = document.createElement("div");
    _0x180fff.className = "node-port out-port";
    const _0x46fd78 = document.createElement("div");
    _0x46fd78.className = "group-resizer";
    _0x46fd78.addEventListener("pointerdown", _0x1b1d05 => {
      _0x1b1d05.stopPropagation();
      startNodeResizePreview({
        event: _0x1b1d05,
        nodeId: this.id,
        getNode: () => a607_0x1e769c.getStateRaw().nodes?.[this.id] || this._data,
        getViewport: () => a607_0x1e769c.getStateRaw().viewport,
        resolveSize: ({
          startWidth: _0x3b282f,
          startHeight: _0x5b9d87,
          dx: _0x1ec0cd,
          dy: _0x5096a9
        }) => clampWebPreviewNodeSize({
          width: _0x3b282f + _0x1ec0cd,
          height: _0x5b9d87 + _0x5096a9
        }),
        applyPatch: _0x3e86a8 => a607_0x1e769c.updateNodeData(this.id, _0x3e86a8),
        commit: commit
      });
    });
    _0x36bc20.appendChild(_0x42baa7.element);
    _0x36bc20.appendChild(_0x2515cc.element);
    _0x36bc20.appendChild(_0x54a2c9);
    _0x36bc20.appendChild(_0x42b7ba);
    _0x36bc20.appendChild(_0x180fff);
    _0x36bc20.appendChild(_0x46fd78);
    this.el.replaceChildren(_0x36bc20);
    this._toolbar = _0x42baa7;
    this._tabBar = _0x2515cc;
    this._startPageView = _0x71e0fb;
    this._input = _0x42baa7.input;
    this._emptyInput = _0x71e0fb.input;
    this._slot = _0x54a2c9;
    this._unregisterSlot?.();
    this._unregisterSlot = registerWebPreviewSlot(this.id, _0x54a2c9);
    this._placeholder = _0x35c0cf;
    this._status = _0x42b7ba;
    this._freezeLayer = _0x61e112;
    this._freezeImage = _0x9aaf20;
    this._backButtons = [_0x42baa7.backButton];
    this._forwardButtons = [_0x42baa7.forwardButton];
    this._syncDom();
    this._renderStartPageTiles();
    this._syncNavigationButtons();
    this._bindNativeEvents();
    this._bindLocaleChange();
    return this.el;
  }
  _createTabBarView() {
    return new WebPreviewTabBarView({
      onActivate: _0x567f74 => this._activateTab(_0x567f74),
      onClose: _0x5c3bae => this._closeTab(_0x5c3bae),
      onAdd: () => this._addTab()
    });
  }
  _bindLocaleChange() {
    if (this._unsubscribeLocale) {
      return;
    }
    this._unsubscribeLocale = onLocaleChange(() => this._syncLocaleTexts());
  }
  _syncLocaleTexts() {
    this._toolbar?.syncLocale?.();
    this._fullscreenToolbar?.syncLocale?.();
    this._startPageView?.syncLocale?.();
    this._tabBar?.setTabs(this._data);
    this._fullscreenTabBar?.setTabs(this._data);
    if (!this._getActiveUrl()) {
      this._setStatus(getWebPreviewDefaultStatusText());
    }
  }
  _requestLiveWebView() {
    try {
      const _0x5502a9 = a607_0x1e769c.getStateRaw?.().selectedNodeIds || a607_0x1e769c.getState?.().selectedNodeIds || [];
      if (!_0x5502a9.includes(this.id)) {
        a607_0x1e769c.setSelectedNodes([this.id]);
      }
    } catch {}
    dispatchWebPreviewForceSync(this.id);
  }
  _isRemoteBrowserSurface() {
    return this.el.classList.contains("is-remote-browser-surface") && desktopBridge.webPreview.surfaceMode === "remote-snapshot";
  }
  _dispatchRemoteInput(_0x2b5877 = {}) {
    if (!this._isRemoteBrowserSurface()) {
      return;
    }
    this._remoteInputQueue?.enqueue?.(_0x2b5877);
  }
  _getRemotePointerPosition(_0x120e65) {
    const _0x472b00 = this._freezeLayer?.getBoundingClientRect?.();
    if (!_0x472b00?.width || !_0x472b00?.height) {
      return null;
    }
    return {
      xRatio: Math.max(0, Math.min(1, (Number(_0x120e65?.clientX) - _0x472b00.left) / _0x472b00.width)),
      yRatio: Math.max(0, Math.min(1, (Number(_0x120e65?.clientY) - _0x472b00.top) / _0x472b00.height))
    };
  }
  _handleRemotePointerInput(_0x3d8b50, _0x3be117) {
    if (!this._isRemoteBrowserSurface()) {
      return;
    }
    const _0x5d9700 = this._getRemotePointerPosition(_0x3be117);
    if (!_0x5d9700) {
      return;
    }
    _0x3be117.preventDefault();
    _0x3be117.stopPropagation();
    this._requestLiveWebView();
    if (_0x3d8b50 === "mousePressed") {
      try {
        this._freezeLayer?.focus?.({
          preventScroll: true
        });
        this._freezeLayer?.setPointerCapture?.(_0x3be117.pointerId);
      } catch {}
    } else {
      try {
        this._freezeLayer?.releasePointerCapture?.(_0x3be117.pointerId);
      } catch {}
    }
    this._dispatchRemoteInput({
      kind: "mouse",
      type: _0x3d8b50,
      ..._0x5d9700,
      button: Number(_0x3be117.button),
      buttons: Number(_0x3be117.buttons),
      clickCount: Math.max(1, Number(_0x3be117.detail) || 1),
      altKey: _0x3be117.altKey === true,
      ctrlKey: _0x3be117.ctrlKey === true,
      metaKey: _0x3be117.metaKey === true,
      shiftKey: _0x3be117.shiftKey === true
    });
  }
  _handleRemotePointerMoveInput(_0x4f6061) {
    if (!this._isRemoteBrowserSurface()) {
      return;
    }
    const _0x4e06d8 = this._getRemotePointerPosition(_0x4f6061);
    if (!_0x4e06d8) {
      return;
    }
    _0x4f6061.preventDefault();
    _0x4f6061.stopPropagation();
    const _0x131fe4 = Math.max(0, Number(_0x4f6061.buttons) || 0);
    const _0x210f51 = (_0x131fe4 & 1) !== 0 ? "left" : (_0x131fe4 & 4) !== 0 ? "middle" : (_0x131fe4 & 2) !== 0 ? "right" : "none";
    this._dispatchRemoteInput({
      kind: "mouse",
      type: "mouseMoved",
      ..._0x4e06d8,
      button: _0x210f51,
      buttons: _0x131fe4,
      clickCount: 0,
      altKey: _0x4f6061.altKey === true,
      ctrlKey: _0x4f6061.ctrlKey === true,
      metaKey: _0x4f6061.metaKey === true,
      shiftKey: _0x4f6061.shiftKey === true
    });
  }
  _handleRemoteWheelInput(_0x2da777) {
    if (!this._isRemoteBrowserSurface()) {
      return;
    }
    const _0x173cbb = this._getRemotePointerPosition(_0x2da777);
    if (!_0x173cbb) {
      return;
    }
    _0x2da777.preventDefault();
    _0x2da777.stopPropagation();
    const _0x8a3b7e = this._remoteWheelInput;
    this._remoteWheelInput = {
      kind: "mouse",
      type: "mouseWheel",
      ..._0x173cbb,
      button: "none",
      buttons: 0,
      clickCount: 0,
      deltaX: (Number(_0x8a3b7e?.deltaX) || 0) + (Number(_0x2da777.deltaX) || 0),
      deltaY: (Number(_0x8a3b7e?.deltaY) || 0) + (Number(_0x2da777.deltaY) || 0),
      altKey: _0x2da777.altKey === true,
      ctrlKey: _0x2da777.ctrlKey === true,
      metaKey: _0x2da777.metaKey === true,
      shiftKey: _0x2da777.shiftKey === true
    };
    if (this._remoteWheelTimer !== null) {
      return;
    }
    this._remoteWheelTimer = globalThis.setTimeout(() => {
      this._remoteWheelTimer = null;
      const _0x3d3b01 = this._remoteWheelInput;
      this._remoteWheelInput = null;
      if (_0x3d3b01) {
        this._dispatchRemoteInput(_0x3d3b01);
      }
    }, 16);
  }
  _handleRemoteKeyInput(_0x2accbd, _0x5ae253) {
    if (!this._isRemoteBrowserSurface()) {
      return;
    }
    _0x5ae253.preventDefault();
    _0x5ae253.stopPropagation();
    const _0x3675d7 = _0x2accbd === "keyDown" && String(_0x5ae253.key || "").length === 1 && !_0x5ae253.altKey && !_0x5ae253.ctrlKey && !_0x5ae253.metaKey;
    this._dispatchRemoteInput({
      kind: "key",
      type: _0x2accbd,
      key: String(_0x5ae253.key || ""),
      code: String(_0x5ae253.code || ""),
      text: _0x3675d7 ? String(_0x5ae253.key || "") : "",
      keyCode: Number(_0x5ae253.keyCode) || 0,
      repeat: _0x5ae253.repeat === true,
      altKey: _0x5ae253.altKey === true,
      ctrlKey: _0x5ae253.ctrlKey === true,
      metaKey: _0x5ae253.metaKey === true,
      shiftKey: _0x5ae253.shiftKey === true
    });
  }
  _getTabState() {
    return normalizeWebPreviewTabs(this._data);
  }
  _getActiveTabId() {
    return this._getTabState().activeTabId;
  }
  _getActiveUrl() {
    return getWebPreviewActiveTabUrl(this._data);
  }
  _applyTabPatch(_0x5219dd, {
    commitHistory = false
  } = {}) {
    if (!_0x5219dd) {
      return;
    }
    this._data = {
      ...this._data,
      ..._0x5219dd
    };
    a607_0x1e769c.updateNodeData(this.id, _0x5219dd);
    if (commitHistory) {
      commit();
    }
    this._clearSnapshot();
    this._syncDom();
    dispatchWebPreviewForceSync(this.id);
  }
  _addTab({
    id = "",
    url = "",
    title = "",
    pendingPopup = false
  } = {}) {
    const _0x4f9705 = addWebPreviewTabData(this._data, {
      id: id,
      url: url,
      title: title,
      pendingPopup: pendingPopup
    });
    if (_0x4f9705.ok === false) {
      globalThis.window?.showToast?.(webPreviewText("toasts.maxTabs"), "warning");
      return _0x4f9705;
    }
    this._applyTabPatch(_0x4f9705.patch, {
      commitHistory: true
    });
    this._setStatus(getWebPreviewDefaultStatusText());
    return _0x4f9705;
  }
  _activateTab(_0x35b80f) {
    const _0x258be5 = activateWebPreviewTabData(this._data, _0x35b80f);
    if (_0x258be5.ok === false) {
      return;
    }
    this._applyTabPatch(_0x258be5.patch);
    this._syncNavigationButtons();
  }
  _disposeNativeTab(_0x451e1c) {
    if (!_0x451e1c || !desktopBridge.webPreview.isAvailable()) {
      return;
    }
    const _0x47f8ff = desktopBridge.webPreview.disposeViews({
      nodeIds: [this.id],
      tabIds: [_0x451e1c]
    });
    if (_0x47f8ff && typeof _0x47f8ff.catch === "function") {
      _0x47f8ff.catch(() => {});
    }
  }
  _closeTab(_0x17a35f) {
    const _0x1d6803 = closeWebPreviewTabData(this._data, _0x17a35f);
    if (_0x1d6803.ok === false) {
      return;
    }
    this._disposeNativeTab(_0x1d6803.closedTabId);
    this._navigationStateByTabId.delete(_0x1d6803.closedTabId);
    this._applyTabPatch(_0x1d6803.patch, {
      commitHistory: true
    });
    this._syncNavigationButtons();
    if (!_0x1d6803.state.webUrl) {
      this._setStatus(getWebPreviewDefaultStatusText());
    }
  }
  _openPopupTab(_0x2bdbbb, {
    tabId = "",
    pendingPopup = false
  } = {}) {
    const _0x4ecbc9 = normalizeWebPreviewUrl(_0x2bdbbb);
    if (!_0x4ecbc9 && pendingPopup !== true) {
      return;
    }
    const _0x2ce02a = this._addTab({
      id: tabId,
      url: _0x4ecbc9,
      title: pendingPopup === true ? webPreviewText("tabs.loginWindow") : "",
      pendingPopup: pendingPopup === true && !_0x4ecbc9
    });
    if (_0x2ce02a?.ok === false) {
      if (tabId) {
        this._disposeNativeTab(tabId);
      }
      return;
    }
    if (_0x2ce02a?.ok) {
      this._setStatus(webPreviewText("status.loading"));
    }
  }
  _renderStartPageTiles() {
    this._startPageView?.renderTiles();
  }
  _bindNativeEvents() {
    const _0x3ae930 = globalThis.window;
    if (!_0x3ae930 || typeof _0x3ae930.addEventListener !== "function") {
      return;
    }
    const _0x53f640 = _0x5e1810 => {
      const _0x5e8921 = _0x5e1810?.detail || {};
      if (_0x5e8921.nodeId !== this.id) {
        return;
      }
      const _0x2193d3 = _0x5e8921.tabId || this._getActiveTabId();
      const _0x3c9cb4 = _0x2193d3 === this._getActiveTabId();
      if (_0x5e8921.type === "loading") {
        if (_0x3c9cb4) {
          if (_0x5e8921.holdSnapshot === true) {
            this.el.classList.add("is-web-preview-loading");
          } else {
            this._clearSnapshot();
          }
          this._setStatus(webPreviewText("status.loading"));
        }
      } else if (_0x5e8921.type === "loaded") {
        if (_0x3c9cb4) {
          this.el.classList.remove("is-web-preview-loading");
          this._setStatus(webPreviewText("status.loaded"));
        }
      } else if (_0x5e8921.type === "failed") {
        if (_0x3c9cb4) {
          this.el.classList.remove("is-web-preview-loading");
          this._setStatus(_0x5e8921.message || webPreviewText("status.loadFailed"));
        }
      } else if (_0x5e8921.type === "blocked") {
        if (_0x3c9cb4) {
          this.el.classList.remove("is-web-preview-loading");
          this._setStatus(_0x5e8921.message || webPreviewText("status.blocked"));
        }
      } else if (_0x5e8921.type === "open-popup") {
        this._openPopupTab(_0x5e8921.url, {
          tabId: _0x5e8921.popupTabId,
          pendingPopup: _0x5e8921.pendingPopup === true
        });
      } else if (_0x5e8921.type === "closed") {
        if (_0x2193d3) {
          this._closeTab(_0x2193d3);
        }
      } else if (_0x5e8921.type === "send-selected-text") {
        const _0xe0b51 = createWebPreviewTextNodeFromSelection({
          nodeId: this.id,
          payload: _0x5e8921
        });
        if (_0xe0b51) {
          globalThis.window?.showToast?.(webPreviewText("toasts.textSent"), "success");
        }
      } else if (_0x5e8921.type === WEB_PREVIEW_TEXT_SOURCE_EVENT) {
        const _0x54d382 = createWebPreviewSourceTextNodeFromSelection({
          nodeId: this.id,
          payload: _0x5e8921
        });
        if (_0x54d382) {
          globalThis.window?.showToast?.(webPreviewText("toasts.sourceTextSent"), "success");
        }
      } else if (_0x5e8921.type === WEB_PREVIEW_TEXT_IMAGE_PROMPT_EVENT || _0x5e8921.type === WEB_PREVIEW_TEXT_IMAGE_PROMPT_GENERATE_EVENT) {
        const _0x2ae390 = createWebPreviewImagePromptNodeFromSelection({
          nodeId: this.id,
          payload: _0x5e8921
        });
        if (_0x2ae390 && _0x5e8921.type === WEB_PREVIEW_TEXT_IMAGE_PROMPT_GENERATE_EVENT) {
          this._runImagePromptGeneration(_0x2ae390);
        } else if (_0x2ae390) {
          globalThis.window?.showToast?.(webPreviewText("toasts.imagePromptCreated"), "success");
        }
      } else if (_0x5e8921.type === WEB_PREVIEW_TEXT_VIDEO_PROMPT_EVENT || _0x5e8921.type === WEB_PREVIEW_TEXT_VIDEO_PROMPT_GENERATE_EVENT) {
        const _0x26b3fa = createWebPreviewVideoPromptNodeFromSelection({
          nodeId: this.id,
          payload: _0x5e8921
        });
        if (_0x26b3fa && _0x5e8921.type === WEB_PREVIEW_TEXT_VIDEO_PROMPT_GENERATE_EVENT) {
          this._runVideoPromptGeneration(_0x26b3fa);
        } else if (_0x26b3fa) {
          globalThis.window?.showToast?.(webPreviewText("toasts.videoPromptCreated"), "success");
        }
      } else if (_0x5e8921.type === "send-image-to-canvas") {
        const _0x37c1ba = createWebPreviewImageNodeFromContext({
          nodeId: this.id,
          payload: _0x5e8921
        });
        if (_0x37c1ba) {
          globalThis.window?.showToast?.(webPreviewText("toasts.imageAdded"), "success");
        }
      } else if (_0x5e8921.type === "reverse-image-prompt" || _0x5e8921.type === WEB_PREVIEW_REVERSE_PROMPT_GENERATE_EVENT) {
        const _0xd1fcf3 = createWebPreviewReverseImagePromptNodes({
          nodeId: this.id,
          payload: _0x5e8921
        });
        if (_0xd1fcf3 && _0x5e8921.type === WEB_PREVIEW_REVERSE_PROMPT_GENERATE_EVENT) {
          this._runReverseImagePromptGeneration(_0xd1fcf3);
        } else if (_0xd1fcf3) {
          globalThis.window?.showToast?.(webPreviewText("toasts.reversePromptCreated"), "success");
        }
      } else if (_0x5e8921.type === "favicon") {
        this._applyFavicon(_0x5e8921.faviconUrl, _0x2193d3);
      } else if (_0x5e8921.type === "navigated") {
        this._applyNavigatedUrl(_0x5e8921.url, _0x2193d3);
      } else if (_0x5e8921.type === "navigation-state") {
        this._setNavigationState(_0x5e8921);
      } else if (_0x5e8921.type === "snapshot" && _0x3c9cb4) {
        this._applySnapshot(_0x5e8921);
      }
    };
    _0x3ae930.addEventListener("web-preview:native-event", _0x53f640);
    this._unsubscribeNativeEvent = () => {
      _0x3ae930.removeEventListener?.("web-preview:native-event", _0x53f640);
    };
  }
  async _runCreatedNodeGeneration(_0x59be04, {
    startedKey: _0x3fdf03,
    failedKey: _0x4eabe4,
    nodeNotReadyKey: _0x4140f0
  } = {}) {
    const _0x5c052c = String(_0x59be04 || "").trim();
    const _0x1bcfe6 = globalThis.window?.showToast;
    const _0x4dd6b6 = _0x472144 => {
      _0x1bcfe6?.(webPreviewText(_0x4eabe4 || "toasts.reversePromptGenerateFailed", {
        error: String(_0x472144 || webPreviewText("toasts.reversePromptGenerateUnavailable"))
      }), "warning");
    };
    if (!_0x5c052c) {
      _0x4dd6b6(webPreviewText("toasts.reversePromptGenerateUnavailable"));
      return;
    }
    const _0x189988 = await waitForMountedCanvasNode(_0x5c052c);
    if (!_0x189988) {
      _0x4dd6b6(webPreviewText(_0x4140f0 || "toasts.reversePromptGenerateNodeNotReady"));
      return;
    }
    const _0x17c3ec = globalThis.window?.canvasCommands;
    if (typeof _0x17c3ec?.executeCanvasCommand !== "function") {
      _0x4dd6b6(webPreviewText("toasts.reversePromptGenerateUnavailable"));
      return;
    }
    _0x1bcfe6?.(webPreviewText(_0x3fdf03 || "toasts.reversePromptGenerateStarted"), "success");
    try {
      const _0x4edb4c = await _0x17c3ec.executeCanvasCommand("generation.run", {
        nodeId: _0x5c052c
      });
      if (_0x4edb4c?.ok === false) {
        _0x4dd6b6(getCanvasCommandFailureText(_0x4edb4c));
      }
    } catch (_0x4bbff5) {
      _0x4dd6b6(_0x4bbff5?.message || _0x4bbff5);
    }
  }
  async _runReverseImagePromptGeneration(_0x2427d6) {
    await this._runCreatedNodeGeneration(_0x2427d6?.textNode?.id, {
      startedKey: "toasts.reversePromptGenerateStarted",
      failedKey: "toasts.reversePromptGenerateFailed",
      nodeNotReadyKey: "toasts.reversePromptGenerateNodeNotReady"
    });
  }
  async _runImagePromptGeneration(_0x53e9a9) {
    await this._runCreatedNodeGeneration(_0x53e9a9?.id, {
      startedKey: "toasts.imagePromptGenerateStarted",
      failedKey: "toasts.imagePromptGenerateFailed",
      nodeNotReadyKey: "toasts.imagePromptGenerateNodeNotReady"
    });
  }
  async _runVideoPromptGeneration(_0x59aa56) {
    await this._runCreatedNodeGeneration(_0x59aa56?.id, {
      startedKey: "toasts.videoPromptGenerateStarted",
      failedKey: "toasts.videoPromptGenerateFailed",
      nodeNotReadyKey: "toasts.videoPromptGenerateNodeNotReady"
    });
  }
  _readUrlInputValue() {
    const _0x50869a = globalThis.document?.activeElement || null;
    if (_0x50869a === this._fullscreenInput) {
      return this._fullscreenInput?.value || "";
    }
    if (_0x50869a === this._input) {
      return this._input?.value || "";
    }
    if (_0x50869a === this._emptyInput) {
      return this._emptyInput?.value || "";
    }
    return this._fullscreenInput?.value || this._input?.value || this._emptyInput?.value || this._getActiveUrl() || "";
  }
  _commitUrl(_0x481e67 = this._readUrlInputValue(), {
    title = ""
  } = {}) {
    const _0x73fe67 = normalizeWebPreviewAddressInput(_0x481e67);
    const _0x2874e3 = this._getActiveTabId();
    const _0x462097 = desktopBridge.webPreview.isAvailable();
    if (_0x73fe67 && title) {
      this._pendingVisitTitles.set(getPendingVisitKey(_0x2874e3, _0x73fe67), title);
    }
    const _0x2b087b = commitWebPreviewNodeUrl({
      nodeId: this.id,
      rawUrl: _0x481e67,
      title: title,
      tabId: _0x2874e3,
      nodeData: this._data,
      recordVisitFn: _0x462097 ? null : recordWebPreviewVisit
    });
    if (_0x2b087b.ok) {
      this._data = {
        ...this._data,
        ..._0x2b087b.patch
      };
      this._syncDom();
      this._renderStartPageTiles();
      this._setStatus(webPreviewText("status.loading"));
    }
  }
  _refresh() {
    const _0x35bb88 = desktopBridge.webPreview;
    const _0x5afc90 = this._getActiveTabId();
    if (!this._getActiveUrl() || !_0x35bb88.isAvailable()) {
      return;
    }
    const _0x18d67e = _0x35bb88.controlView({
      nodeId: this.id,
      tabId: _0x5afc90,
      action: "reload"
    });
    if (_0x18d67e && typeof _0x18d67e.catch === "function") {
      _0x18d67e.catch(() => {});
    }
    this._setStatus(webPreviewText("status.refreshing"));
  }
  _navigate(_0x110753) {
    const _0x27b4e9 = desktopBridge.webPreview;
    const _0x95bb53 = this._getActiveTabId();
    if (!this._getActiveUrl() || !_0x27b4e9.isAvailable()) {
      return;
    }
    _0x27b4e9.controlView({
      nodeId: this.id,
      tabId: _0x95bb53,
      action: _0x110753
    }).then(_0x5dd4f0 => {
      if (_0x5dd4f0?.ok === false && _0x5dd4f0.error === "no-history") {
        this._setNavigationState({
          ..._0x5dd4f0,
          tabId: _0x95bb53
        });
      }
    }).catch(() => {});
  }
  _extractMedia() {
    const _0x5915e6 = desktopBridge.webPreview;
    const _0x40b985 = this._getActiveTabId();
    if (!this._getActiveUrl() || !_0x5915e6.isAvailable()) {
      globalThis.window?.showToast?.(webPreviewText("toasts.openPageFirst"), "warning");
      return;
    }
    _0x5915e6.controlView({
      nodeId: this.id,
      tabId: _0x40b985,
      action: "extract-media"
    }).then(_0x5962fc => {
      if (_0x5962fc?.ok === false) {
        globalThis.window?.showToast?.(webPreviewText("toasts.extractMediaFailed"), "error");
        return;
      }
      const _0x392a96 = Array.isArray(_0x5962fc?.images) ? _0x5962fc.images : [];
      const _0xadf334 = Array.isArray(_0x5962fc?.videos) ? _0x5962fc.videos : [];
      openWebPreviewMediaPicker({
        nodeId: this.id,
        imageCandidates: _0x392a96,
        videoCandidates: _0xadf334
      });
    }).catch(() => {
      globalThis.window?.showToast?.(webPreviewText("toasts.extractMediaFailed"), "error");
    });
  }
  _saveReferenceCard() {
    const _0x2f2ef3 = desktopBridge.webPreview;
    const _0x3a1802 = this._getActiveTabId();
    if (!this._getActiveUrl() || !_0x2f2ef3.isAvailable()) {
      globalThis.window?.showToast?.(webPreviewText("toasts.openPageFirst"), "warning");
      return;
    }
    _0x2f2ef3.controlView({
      nodeId: this.id,
      tabId: _0x3a1802,
      action: "capture-reference"
    }).then(_0x437567 => {
      if (_0x437567?.ok === false) {
        globalThis.window?.showToast?.(webPreviewText("toasts.saveReferenceFailed"), "error");
        return;
      }
      const _0x1461f9 = createWebReferenceCardNode({
        nodeId: this.id,
        payload: _0x437567
      });
      if (_0x1461f9) {
        globalThis.window?.showToast?.(webPreviewText("toasts.referenceAdded"), "success");
      }
    }).catch(() => {
      globalThis.window?.showToast?.(webPreviewText("toasts.saveReferenceFailed"), "error");
    });
  }
  _openExternal() {
    const _0x45f18a = normalizeWebPreviewAddressInput(this._readUrlInputValue());
    if (!_0x45f18a) {
      globalThis.window?.showToast?.(webPreviewText("toasts.addressRequired"), "warning");
      return;
    }
    openExternalLink(_0x45f18a, {
      label: webPreviewText("nodeName")
    }).catch(_0x24d874 => {
      globalThis.window?.showToast?.(_0x24d874?.message || webPreviewText("toasts.openExternalFailed"), "error");
    });
  }
  _openFullscreen() {
    const _0x116a0e = normalizeWebPreviewAddressInput(this._readUrlInputValue());
    if (!_0x116a0e) {
      globalThis.window?.showToast?.(webPreviewText("toasts.addressRequired"), "warning");
      return;
    }
    if (_0x116a0e !== normalizeWebPreviewUrl(this._getActiveUrl())) {
      this._commitUrl(_0x116a0e);
    }
    if (this._fullscreenOverlay?.isConnected) {
      dispatchWebPreviewForceSync(this.id);
      return;
    }
    const _0x42fd76 = document.createElement("div");
    _0x42fd76.className = "web-preview-fullscreen-overlay";
    _0x42fd76.addEventListener("pointerdown", _0x7920e9 => _0x7920e9.stopPropagation());
    const _0x57c6c9 = createWebPreviewToolbar({
      className: "web-preview-fullscreen-header",
      url: _0x116a0e,
      onSubmit: _0x56d794 => this._commitUrl(_0x56d794),
      onBack: () => this._navigate("back"),
      onForward: () => this._navigate("forward"),
      onRefresh: () => this._refresh(),
      onExtractMedia: () => this._extractMedia(),
      onSaveReference: () => this._saveReferenceCard(),
      onExternal: () => this._openExternal(),
      onExit: () => this._closeFullscreen()
    });
    const _0x2b9a8f = this._createTabBarView();
    const _0x158bc1 = document.createElement("div");
    _0x158bc1.className = "web-preview-fullscreen-body";
    _0x158bc1.dataset.webPreviewSlot = "true";
    _0x158bc1.dataset.webPreviewFullscreen = "true";
    _0x158bc1.dataset.nodeId = this.id;
    _0x158bc1.dataset.tabId = this._getActiveTabId();
    _0x158bc1.dataset.webUrl = this._getActiveUrl() || _0x116a0e;
    _0x42fd76.appendChild(_0x57c6c9.element);
    _0x42fd76.appendChild(_0x2b9a8f.element);
    _0x42fd76.appendChild(_0x158bc1);
    document.body.appendChild(_0x42fd76);
    this._fullscreenOverlay = _0x42fd76;
    this._fullscreenToolbar = _0x57c6c9;
    this._fullscreenInput = _0x57c6c9.input;
    this._fullscreenTabBar = _0x2b9a8f;
    this._fullscreenSlot = _0x158bc1;
    this._unregisterFullscreenSlot?.();
    this._unregisterFullscreenSlot = registerWebPreviewSlot(this.id, _0x158bc1);
    this._backButtons = [this._backButtons[0], _0x57c6c9.backButton].filter(Boolean);
    this._forwardButtons = [this._forwardButtons[0], _0x57c6c9.forwardButton].filter(Boolean);
    this._fullscreenKeyHandler = _0x35769c => {
      if (_0x35769c.key === "Escape") {
        this._closeFullscreen();
      }
    };
    globalThis.window?.addEventListener?.("keydown", this._fullscreenKeyHandler);
    this._syncDom();
    this._syncNavigationButtons();
    dispatchWebPreviewForceSync(this.id);
  }
  _closeFullscreen() {
    if (!this._fullscreenOverlay) {
      return;
    }
    this._fullscreenOverlay.remove();
    this._fullscreenOverlay = null;
    this._fullscreenToolbar = null;
    this._fullscreenInput = null;
    this._fullscreenSlot = null;
    this._unregisterFullscreenSlot?.();
    this._unregisterFullscreenSlot = null;
    if (this._fullscreenKeyHandler) {
      globalThis.window?.removeEventListener?.("keydown", this._fullscreenKeyHandler);
      this._fullscreenKeyHandler = null;
    }
    this._backButtons = [this._backButtons[0]].filter(Boolean);
    this._forwardButtons = [this._forwardButtons[0]].filter(Boolean);
    dispatchWebPreviewForceSync(this.id);
  }
  _applyNavigatedUrl(_0x588085, _0x39d1c2 = this._getActiveTabId()) {
    const _0x5048f4 = normalizeWebPreviewUrl(_0x588085);
    if (!_0x5048f4) {
      return;
    }
    const _0x2e59d3 = getPendingVisitKey(_0x39d1c2, _0x5048f4);
    const _0xf616e0 = this._pendingVisitTitles.get(_0x2e59d3) || "";
    this._pendingVisitTitles.delete(_0x2e59d3);
    recordWebPreviewVisit({
      url: _0x5048f4,
      title: _0xf616e0
    });
    this._renderStartPageTiles();
    const _0x1e15f4 = updateWebPreviewTabUrlData(this._data, {
      tabId: _0x39d1c2,
      url: _0x5048f4,
      title: _0xf616e0,
      activate: _0x39d1c2 === this._getActiveTabId()
    });
    if (_0x1e15f4.ok === false) {
      return;
    }
    this._data = {
      ...this._data,
      ..._0x1e15f4.patch
    };
    a607_0x1e769c.updateNodeData(this.id, _0x1e15f4.patch);
    this._syncDom();
  }
  _applyFavicon(_0x112514, _0x58fe3c = this._getActiveTabId()) {
    const _0x5931a0 = updateWebPreviewTabFaviconData(this._data, {
      tabId: _0x58fe3c,
      faviconUrl: _0x112514
    });
    if (_0x5931a0.ok === false) {
      return;
    }
    this._data = {
      ...this._data,
      ..._0x5931a0.patch
    };
    a607_0x1e769c.updateNodeData(this.id, _0x5931a0.patch);
    this._syncDom();
  }
  _setNavigationState(_0x5868a3 = {}) {
    const _0x1dbd8b = _0x5868a3.tabId || this._getActiveTabId();
    const _0x8368 = {
      canGoBack: Boolean(_0x5868a3.canGoBack),
      canGoForward: Boolean(_0x5868a3.canGoForward)
    };
    this._navigationStateByTabId.set(_0x1dbd8b, _0x8368);
    if (_0x1dbd8b === this._getActiveTabId()) {
      this._navigationState = _0x8368;
    }
    this._syncNavigationButtons();
  }
  _syncNavigationButtons() {
    this._navigationState = this._navigationStateByTabId.get(this._getActiveTabId()) || {
      canGoBack: false,
      canGoForward: false
    };
    for (const _0xead862 of this._backButtons) {
      if (_0xead862) {
        _0xead862.disabled = !this._navigationState.canGoBack;
      }
    }
    for (const _0x4362b1 of this._forwardButtons) {
      if (_0x4362b1) {
        _0x4362b1.disabled = !this._navigationState.canGoForward;
      }
    }
  }
  _setStatus(_0x1b2e65) {
    this._statusText = String(_0x1b2e65 || getWebPreviewDefaultStatusText());
    if (this._status) {
      this._status.textContent = this._statusText;
    }
    this._startPageView?.setStatus(this._statusText);
  }
  _applySnapshot(_0x392ee1 = {}) {
    const _0x4edf3d = String(_0x392ee1.dataUrl || "");
    if (!_0x4edf3d.startsWith("data:image/") || !this._freezeImage) {
      return;
    }
    const _0x511174 = String(_0x392ee1.freezeToken || "ready");
    const _0x1d755a = Number(_0x392ee1.width);
    const _0x4dbdeb = Number(_0x392ee1.height);
    const _0x241f8b = Number(_0x392ee1.zoomFactor);
    const _0x393919 = this._freezeSnapshotSerial + 1;
    this._freezeSnapshotSerial = _0x393919;
    if (_0x392ee1.streaming === true) {
      this._freezeImage.src = _0x4edf3d;
      this.el.dataset.webPreviewSnapshotToken = _0x511174;
      if (Number.isFinite(_0x1d755a) && _0x1d755a > 0) {
        this.el.dataset.webPreviewSnapshotWidth = String(_0x1d755a);
      }
      if (Number.isFinite(_0x4dbdeb) && _0x4dbdeb > 0) {
        this.el.dataset.webPreviewSnapshotHeight = String(_0x4dbdeb);
      }
      if (Number.isFinite(_0x241f8b) && _0x241f8b > 0) {
        this.el.dataset.webPreviewSnapshotZoomFactor = String(_0x241f8b);
      }
      this.el.classList.add("is-remote-browser-surface", "has-freeze-snapshot");
      return;
    }
    let _0x2200ed = false;
    const _0x8f3ca6 = () => {
      if (_0x2200ed) {
        return;
      }
      if (this._freezeSnapshotSerial !== _0x393919 || !this._freezeImage) {
        return;
      }
      _0x2200ed = true;
      this._freezeImage.src = _0x4edf3d;
      this.el.dataset.webPreviewSnapshotToken = _0x511174;
      if (Number.isFinite(_0x1d755a) && _0x1d755a > 0) {
        this.el.dataset.webPreviewSnapshotWidth = String(_0x1d755a);
      } else {
        delete this.el.dataset.webPreviewSnapshotWidth;
      }
      if (Number.isFinite(_0x4dbdeb) && _0x4dbdeb > 0) {
        this.el.dataset.webPreviewSnapshotHeight = String(_0x4dbdeb);
      } else {
        delete this.el.dataset.webPreviewSnapshotHeight;
      }
      if (Number.isFinite(_0x241f8b) && _0x241f8b > 0) {
        this.el.dataset.webPreviewSnapshotZoomFactor = String(_0x241f8b);
      } else {
        delete this.el.dataset.webPreviewSnapshotZoomFactor;
      }
      if (_0x392ee1.surfaceMode === "remote-snapshot") {
        this.el.classList.add("is-remote-browser-surface");
      }
      this.el.classList.add("has-freeze-snapshot");
      dispatchWebPreviewForceSync(this.id);
    };
    const _0x2f9346 = typeof globalThis.Image === "function" ? new globalThis.Image() : globalThis.document?.createElement?.("img");
    if (!_0x2f9346) {
      _0x8f3ca6();
      return;
    }
    _0x2f9346.onload = _0x8f3ca6;
    _0x2f9346.onerror = () => {
      if (this._freezeSnapshotSerial === _0x393919) {
        this.el.classList.remove("has-freeze-snapshot");
        delete this.el.dataset.webPreviewSnapshotToken;
        delete this.el.dataset.webPreviewSnapshotWidth;
        delete this.el.dataset.webPreviewSnapshotHeight;
        delete this.el.dataset.webPreviewSnapshotZoomFactor;
      }
    };
    _0x2f9346.src = _0x4edf3d;
    if (typeof _0x2f9346.decode === "function") {
      _0x2f9346.decode().then(_0x8f3ca6).catch(() => {
        if (_0x2f9346.complete) {
          _0x8f3ca6();
        }
      });
    } else if (_0x2f9346.complete) {
      _0x8f3ca6();
    }
  }
  _clearSnapshot() {
    this._freezeSnapshotSerial += 1;
    if (this._freezeImage) {
      this._freezeImage.removeAttribute("src");
    }
    delete this.el.dataset.webPreviewSnapshotToken;
    delete this.el.dataset.webPreviewSnapshotWidth;
    delete this.el.dataset.webPreviewSnapshotHeight;
    delete this.el.dataset.webPreviewSnapshotZoomFactor;
    this.el.classList.remove("has-freeze-snapshot", "is-web-preview-loading", "is-remote-browser-surface");
  }
  _syncDom() {
    const _0x3684bf = this._getTabState();
    const _0x1a9a8c = _0x3684bf.webUrl || "";
    this._data = {
      ...this._data,
      activeTabId: _0x3684bf.activeTabId,
      webUrl: _0x1a9a8c
    };
    this._tabBar?.setTabs(this._data);
    this._fullscreenTabBar?.setTabs(this._data);
    if (this._input && document.activeElement !== this._input) {
      this._input.value = _0x1a9a8c;
    }
    this._startPageView?.setUrl(_0x1a9a8c);
    if (this._fullscreenInput && document.activeElement !== this._fullscreenInput) {
      this._fullscreenInput.value = _0x1a9a8c;
    }
    if (this._slot?.dataset) {
      this._slot.dataset.webUrl = _0x1a9a8c;
      this._slot.dataset.nodeId = this.id;
      this._slot.dataset.tabId = _0x3684bf.activeTabId;
    }
    if (this._fullscreenSlot?.dataset) {
      this._fullscreenSlot.dataset.webUrl = _0x1a9a8c;
      this._fullscreenSlot.dataset.nodeId = this.id;
      this._fullscreenSlot.dataset.tabId = _0x3684bf.activeTabId;
    }
    const _0x5d8a9a = Boolean(_0x1a9a8c || _0x3684bf.activeTab?.pendingPopup === true);
    this.el.classList.toggle("has-web-url", _0x5d8a9a);
    if (!_0x5d8a9a) {
      this._renderStartPageTiles();
      this._setStatus(getWebPreviewDefaultStatusText());
    } else if (_0x1a9a8c && !desktopBridge.webPreview.isAvailable()) {
      this._setStatus(webPreviewText("status.nativeUnsupported"));
    }
  }
  update(_0x390630) {
    this._data = _0x390630;
    this._syncDom();
  }
  unmount() {
    this._remoteInputQueue?.dispose?.();
    if (this._remoteWheelTimer !== null) {
      globalThis.clearTimeout(this._remoteWheelTimer);
      this._remoteWheelTimer = null;
    }
    this._remoteWheelInput = null;
    this._closeFullscreen();
    this._unregisterSlot?.();
    this._unregisterSlot = null;
    this._unregisterFullscreenSlot?.();
    this._unregisterFullscreenSlot = null;
    this._unsubscribeNativeEvent?.();
    this._unsubscribeNativeEvent = null;
    this._unsubscribeLocale?.();
    this._unsubscribeLocale = null;
    const _0x5916c9 = desktopBridge.webPreview;
    if (_0x5916c9.isAvailable()) {
      _0x5916c9.disposeViews({
        nodeIds: [this.id]
      });
    }
  }
}