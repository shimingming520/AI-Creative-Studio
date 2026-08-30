import a497_0x421707 from "../core/stores/appStore.js";
import { onLocaleChange, t } from "../i18n/index.js";
import { detectScenes } from "../../api/sceneDetectionApi.js";
import { getDisplayModelName, PROVIDERS_META } from "../modules/providers.js";
import { startLoading, stopLoading } from "../modules/loadingOverlay.js";
import { generateId, findAvailablePosition } from "../core/math.js";
import { getNodeSpawnPrefs } from "../modules/nodeSpawn.js";
import { buildSourceMediaNodePayload, getAutoMediaSizeByShortSide } from "../services/fileService.js";
import { saveTextDownload } from "../services/downloadSaveService.js";
function sceneDetectionText(_0x350aef, _0x4da441 = {}) {
  return t("sceneDetectionNode." + _0x350aef, _0x4da441);
}
const _SCENE_DETECTION_NODE_TEMPLATE = "\n  <div class=\"node-card scene-detection-card\" style=\"width: 100%; height: 100%; padding: 16px; background: var(--white-05); border: 1px solid var(--stroke-08); border-radius: 18px; overflow: hidden; position: relative; display: flex; flex-direction: column; pointer-events: auto;\">\n    <div class=\"scene-detection-header\" style=\"display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;\">\n      <h3 class=\"scene-detection-title\" style=\"margin: 0; font-size: 16px; font-weight: 600; color: var(--text-primary);\"></h3>\n      <button type=\"button\" class=\"detect-btn\" style=\"background: var(--blue); color: white; border: none; border-radius: 8px; padding: 6px 12px; font-size: 12px; cursor: var(--link-cursor);\">\n      </button>\n    </div>\n    \n    <div class=\"scene-detection-input\" style=\"margin-bottom: 16px;\">\n      <div class=\"input-label scene-video-source-label\" style=\"font-size: 12px; color: var(--text-muted); margin-bottom: 8px;\"></div>\n      <div class=\"ref-bar\" style=\"border: 1px dashed var(--stroke-20); border-radius: 8px; padding: 12px; display: flex; align-items: center; justify-content: center; min-height: 60px;\">\n        <div class=\"ref-placeholder\" style=\"color: var(--text-muted); font-size: 12px;\"></div>\n      </div>\n    </div>\n    \n    <div class=\"scene-detection-settings\" style=\"margin-bottom: 16px;\">\n      <div class=\"input-label scene-sensitivity-label\" style=\"font-size: 12px; color: var(--text-muted); margin-bottom: 8px;\"></div>\n      <input type=\"range\" class=\"sensitivity-slider\" min=\"0.1\" max=\"1\" step=\"0.1\" value=\"0.5\" style=\"width: 100%; accent-color: var(--blue);\">\n      <div style=\"display: flex; justify-content: space-between; font-size: 11px; color: var(--text-secondary); margin-top: 4px;\">\n        <span class=\"scene-sensitivity-low\"></span>\n        <span class=\"scene-sensitivity-high\"></span>\n      </div>\n    </div>\n    \n    <div class=\"scene-detection-results\" style=\"flex: 1; border: 1px solid var(--stroke-10); border-radius: 8px; padding: 12px; overflow-y: auto; margin-bottom: 16px;\">\n      <div class=\"results-placeholder\" style=\"color: var(--text-muted); font-size: 12px; text-align: center; padding: 20px 0;\">\n      </div>\n      <div class=\"scene-list\" style=\"display: none;\">\n        <div class=\"scene-count\" style=\"font-size: 12px; font-weight: 600; margin-bottom: 8px;\"><span class=\"scene-count-prefix\"></span> <span class=\"count\">0</span> <span class=\"scene-count-suffix\"></span></div>\n        <div class=\"scene-timeline\" style=\"position: relative; height: 40px; background: var(--white-10); border-radius: 4px; margin-bottom: 12px;\">\n          <div class=\"timeline-markers\" style=\"position: absolute; top: 0; left: 0; right: 0; height: 100%; display: flex; align-items: center;\"></div>\n        </div>\n        <div class=\"scene-items\" style=\"display: flex; flex-direction: column; gap: 8px;\"></div>\n      </div>\n    </div>\n    \n    <div class=\"scene-detection-actions\" style=\"display: flex; gap: 8px;\">\n      <button type=\"button\" class=\"auto-clip-btn\" style=\"flex: 1; background: var(--green); color: white; border: none; border-radius: 8px; padding: 8px 16px; font-size: 12px; cursor: var(--link-cursor); display: none;\">\n      </button>\n      <button type=\"button\" class=\"export-btn\" style=\"flex: 1; background: var(--purple); color: white; border: none; border-radius: 8px; padding: 8px 16px; font-size: 12px; cursor: var(--link-cursor); display: none;\">\n      </button>\n    </div>\n  </div>\n";
export class SceneDetectionNode {
  constructor(_0x217a78) {
    this._data = _0x217a78;
    this.nodeId = _0x217a78.id;
    this.el = document.createElement("div");
    this.el.className = "v2-node-component";
    this._videoSource = null;
    this._detectionResults = null;
    this._isDetecting = false;
    this._sensitivity = 0.5;
    this._unsubscribeLocale = null;
  }
  mount() {
    this._subscribeLocaleChanges();
    const _0x707a3b = this.el;
    _0x707a3b.innerHTML = _SCENE_DETECTION_NODE_TEMPLATE;
    this._card = _0x707a3b.querySelector(".scene-detection-card");
    this._title = _0x707a3b.querySelector(".scene-detection-title");
    this._detectBtn = _0x707a3b.querySelector(".detect-btn");
    this._videoSourceLabel = _0x707a3b.querySelector(".scene-video-source-label");
    this._refBar = _0x707a3b.querySelector(".ref-bar");
    this._refPlaceholder = _0x707a3b.querySelector(".ref-placeholder");
    this._sensitivityLabel = _0x707a3b.querySelector(".scene-sensitivity-label");
    this._sensitivityLow = _0x707a3b.querySelector(".scene-sensitivity-low");
    this._sensitivityHigh = _0x707a3b.querySelector(".scene-sensitivity-high");
    this._sensitivitySlider = _0x707a3b.querySelector(".sensitivity-slider");
    this._resultsContainer = _0x707a3b.querySelector(".scene-detection-results");
    this._resultsPlaceholder = _0x707a3b.querySelector(".results-placeholder");
    this._sceneList = _0x707a3b.querySelector(".scene-list");
    this._sceneCountPrefix = _0x707a3b.querySelector(".scene-count-prefix");
    this._sceneCountSuffix = _0x707a3b.querySelector(".scene-count-suffix");
    this._sceneCount = _0x707a3b.querySelector(".scene-count .count");
    this._timelineMarkers = _0x707a3b.querySelector(".timeline-markers");
    this._sceneItems = _0x707a3b.querySelector(".scene-items");
    this._autoClipBtn = _0x707a3b.querySelector(".auto-clip-btn");
    this._exportBtn = _0x707a3b.querySelector(".export-btn");
    this._detectBtn.addEventListener("click", () => this._startDetection());
    this._sensitivitySlider.addEventListener("input", _0x8ac021 => {
      this._sensitivity = parseFloat(_0x8ac021.target.value);
    });
    this._autoClipBtn.addEventListener("click", () => this._autoClip());
    this._exportBtn.addEventListener("click", () => void this._exportScenes());
    this._syncLocaleTexts();
    this._checkVideoInput();
    return _0x707a3b;
  }
  _checkVideoInput() {
    const _0x1288c5 = a497_0x421707.getIncomingEdges(this.nodeId) || [];
    if (_0x1288c5.length > 0) {
      const _0xbf3c9b = _0x1288c5[0];
      const _0x563ede = a497_0x421707.getState().nodes[_0xbf3c9b.sourceId];
      if (_0x563ede && (_0x563ede.type === "source-video" || _0x563ede.type.includes("video"))) {
        this._videoSource = _0x563ede;
        this._refPlaceholder.textContent = _0x563ede.name || sceneDetectionText("input.videoSource");
        this._refBar.style.borderStyle = "solid";
        this._refBar.style.borderColor = "var(--blue)";
      }
    }
  }
  async _startDetection() {
    if (!this._videoSource) {
      window.showToast(sceneDetectionText("toasts.connectVideoFirst"), "error");
      return;
    }
    if (this._isDetecting) {
      return;
    }
    const _0xc62345 = this._videoSource.src || this._videoSource.videoUrl;
    if (!_0xc62345) {
      window.showToast(sceneDetectionText("toasts.invalidVideoSource"), "error");
      return;
    }
    this._isDetecting = true;
    startLoading(this._card);
    this._detectBtn.textContent = sceneDetectionText("actions.detecting");
    this._detectBtn.disabled = true;
    try {
      const _0x2bcfad = await detectScenes({
        videoUrl: _0xc62345,
        provider: "grsai",
        sensitivity: this._sensitivity
      });
      this._detectionResults = _0x2bcfad;
      this._displayResults(_0x2bcfad);
      a497_0x421707.updateNodeData(this.nodeId, {
        sceneDetectionResults: _0x2bcfad
      });
      window.showToast(sceneDetectionText("toasts.detected", {
        count: _0x2bcfad.sceneCount
      }), "success");
    } catch (_0x17c70f) {
      console.error("场景检测失败:", _0x17c70f);
      window.showToast(sceneDetectionText("toasts.detectFailed"), "error");
    } finally {
      this._isDetecting = false;
      stopLoading(this._card);
      this._detectBtn.textContent = sceneDetectionText("actions.startDetection");
      this._detectBtn.disabled = false;
    }
  }
  _displayResults(_0x28a5c7) {
    this._resultsPlaceholder.style.display = "none";
    this._sceneList.style.display = "block";
    this._autoClipBtn.style.display = "block";
    this._exportBtn.style.display = "block";
    this._sceneCount.textContent = _0x28a5c7.sceneCount;
    this._timelineMarkers.innerHTML = "";
    const _0x362ace = _0x28a5c7.sceneChanges;
    _0x362ace.forEach((_0x1b07c7, _0x10baf5) => {
      const _0x27fcc7 = document.createElement("div");
      _0x27fcc7.style.position = "absolute";
      _0x27fcc7.style.left = _0x1b07c7 / 100 * 100 + "%";
      _0x27fcc7.style.width = "2px";
      _0x27fcc7.style.height = "100%";
      _0x27fcc7.style.background = "var(--red)";
      _0x27fcc7.style.cursor = "var(--link-cursor)";
      _0x27fcc7.title = sceneDetectionText("timeline.changeAt", {
        time: this._formatTime(_0x1b07c7)
      });
      this._timelineMarkers.appendChild(_0x27fcc7);
    });
    this._sceneItems.innerHTML = "";
    let _0x59a4b9 = 0;
    for (let _0x523c1a = 0; _0x523c1a < _0x28a5c7.sceneCount; _0x523c1a++) {
      const _0x5d3e4d = _0x523c1a < _0x28a5c7.sceneChanges.length ? _0x28a5c7.sceneChanges[_0x523c1a] : 100;
      const _0x4a4637 = document.createElement("div");
      _0x4a4637.className = "scene-item";
      _0x4a4637.style.display = "flex";
      _0x4a4637.style.justifyContent = "space-between";
      _0x4a4637.style.alignItems = "center";
      _0x4a4637.style.padding = "8px";
      _0x4a4637.style.background = "var(--white-10)";
      _0x4a4637.style.borderRadius = "4px";
      const _0x4e5fe1 = sceneDetectionText("scene.label", {
        index: _0x523c1a + 1
      });
      const _0x2eabcd = sceneDetectionText("actions.clip");
      _0x4a4637.innerHTML = "\n        <div style=\"font-size: 12px;\">" + _0x4e5fe1 + "</div>\n        <div style=\"font-size: 11px; color: var(--text-secondary);\">" + this._formatTime(_0x59a4b9) + " - " + this._formatTime(_0x5d3e4d) + "</div>\n        <button type=\"button\" class=\"clip-btn\" data-index=\"" + _0x523c1a + "\" style=\"background: var(--blue); color: white; border: none; border-radius: 4px; padding: 4px 8px; font-size: 10px; cursor: var(--link-cursor);\">\n          " + _0x2eabcd + "\n        </button>\n      ";
      this._sceneItems.appendChild(_0x4a4637);
      _0x59a4b9 = _0x5d3e4d;
    }
    this._sceneItems.querySelectorAll(".clip-btn").forEach(_0x2e57da => {
      _0x2e57da.addEventListener("click", _0x764bfc => {
        const _0x33d075 = parseInt(_0x764bfc.target.dataset.index);
        this._clipScene(_0x33d075);
      });
    });
  }
  _formatTime(_0x585058) {
    const _0xfed9b0 = Math.floor(_0x585058 / 60);
    const _0xbe7e12 = Math.floor(_0x585058 % 60);
    return _0xfed9b0 + ":" + _0xbe7e12.toString().padStart(2, "0");
  }
  _autoClip() {
    if (!this._detectionResults) {
      return;
    }
    const _0x1a2065 = this._detectionResults.sceneChanges;
    let _0x3e0357 = 0;
    for (let _0x55ee71 = 0; _0x55ee71 < this._detectionResults.sceneCount; _0x55ee71++) {
      const _0x4f639f = _0x55ee71 < _0x1a2065.length ? _0x1a2065[_0x55ee71] : 100;
      this._createClipNode(_0x3e0357, _0x4f639f, _0x55ee71 + 1);
      _0x3e0357 = _0x4f639f;
    }
    window.showToast(sceneDetectionText("toasts.createdClipNodes", {
      count: this._detectionResults.sceneCount
    }), "success");
  }
  _clipScene(_0x1ed376) {
    if (!this._detectionResults) {
      return;
    }
    const _0x3e89c4 = this._detectionResults.sceneChanges;
    let _0x2a89ea = 0;
    let _0x468238 = 100;
    for (let _0x8dff = 0; _0x8dff <= _0x1ed376; _0x8dff++) {
      if (_0x8dff === _0x1ed376) {
        _0x468238 = _0x8dff < _0x3e89c4.length ? _0x3e89c4[_0x8dff] : 100;
        break;
      }
      _0x2a89ea = _0x3e89c4[_0x8dff];
    }
    this._createClipNode(_0x2a89ea, _0x468238, _0x1ed376 + 1);
    window.showToast(sceneDetectionText("toasts.createdSceneClipNode", {
      index: _0x1ed376 + 1
    }), "success");
  }
  _createClipNode(_0x2b8e1e, _0x45b4b9, _0x2be971) {
    if (!this._videoSource) {
      return;
    }
    const {
      spacing: _0x35d98a,
      direction: _0x149616,
      avoidOverlap: _0xd2a4fd
    } = getNodeSpawnPrefs();
    const _0x482f73 = _0x149616 === "down" ? "down" : "right";
    const _0x3049b1 = Number(this._data.x) || 0;
    const _0x470dae = Number(this._data.y) || 0;
    const _0x572fd8 = Number(this._data.width) || 512;
    const _0x1ee02f = Number(this._data.height) || 288;
    const _0xfec4b6 = getAutoMediaSizeByShortSide(_0x572fd8, _0x1ee02f);
    const _0x27520c = _0x3049b1 + _0x572fd8 + _0x35d98a;
    const _0x13f1c3 = _0x482f73 === "down" ? _0x470dae + _0x1ee02f + _0x35d98a : _0x470dae + Math.round((_0x1ee02f - _0xfec4b6.height) / 2);
    const _0x476a2e = _0xd2a4fd ? findAvailablePosition(a497_0x421707.getState().nodes || {}, _0x27520c, _0x13f1c3, _0xfec4b6.width, _0xfec4b6.height, _0x35d98a, _0x482f73) : {
      x: _0x27520c,
      y: _0x13f1c3
    };
    const _0x13e4c4 = generateId("node");
    a497_0x421707.addNode(buildSourceMediaNodePayload({
      id: _0x13e4c4,
      type: "source-video",
      name: sceneDetectionText("scene.label", {
        index: _0x2be971
      }),
      src: this._videoSource.src,
      localPath: this._videoSource.localPath,
      clipStart: _0x2b8e1e,
      clipEnd: _0x45b4b9,
      x: _0x476a2e.x,
      y: _0x476a2e.y,
      width: _0xfec4b6.width,
      height: _0xfec4b6.height,
      needsAutoResize: false
    }));
    a497_0x421707.addEdge({
      id: generateId("edge"),
      sourceId: this.nodeId,
      targetId: _0x13e4c4,
      refSlot: "scene"
    });
  }
  async _exportScenes() {
    if (!this._detectionResults) {
      return;
    }
    const _0x511353 = {
      videoSource: this._videoSource?.name || sceneDetectionText("export.unknownVideo"),
      sceneCount: this._detectionResults.sceneCount,
      scenes: []
    };
    let _0x7414e9 = 0;
    for (let _0xe618ac = 0; _0xe618ac < this._detectionResults.sceneCount; _0xe618ac++) {
      const _0x5bc633 = _0xe618ac < this._detectionResults.sceneChanges.length ? this._detectionResults.sceneChanges[_0xe618ac] : 100;
      _0x511353.scenes.push({
        number: _0xe618ac + 1,
        startTime: _0x7414e9,
        endTime: _0x5bc633,
        duration: _0x5bc633 - _0x7414e9
      });
      _0x7414e9 = _0x5bc633;
    }
    try {
      const _0x4be9d6 = await saveTextDownload({
        filename: "scenes_" + Date.now() + ".json",
        content: JSON.stringify(_0x511353, null, 2),
        mimeType: "application/json",
        filterName: "JSON"
      });
      if (_0x4be9d6?.canceled) {
        return;
      }
    } catch (_0x539272) {
      window.showToast?.(String(_0x539272?.message || _0x539272), "error");
      return;
    }
    window.showToast(sceneDetectionText("toasts.exported"), "success");
  }
  update(_0x1cebd4) {
    this._data = _0x1cebd4;
    this._checkVideoInput();
    if (_0x1cebd4.sceneDetectionResults) {
      this._detectionResults = _0x1cebd4.sceneDetectionResults;
      this._displayResults(_0x1cebd4.sceneDetectionResults);
    }
  }
  _subscribeLocaleChanges() {
    if (this._unsubscribeLocale) {
      return;
    }
    this._unsubscribeLocale = onLocaleChange(() => {
      this._syncLocaleTexts();
      if (this._detectionResults) {
        this._displayResults(this._detectionResults);
      }
    });
  }
  _syncLocaleTexts() {
    if (this._title) {
      this._title.textContent = sceneDetectionText("title");
    }
    if (this._detectBtn) {
      this._detectBtn.textContent = this._isDetecting ? sceneDetectionText("actions.detecting") : sceneDetectionText("actions.startDetection");
    }
    if (this._videoSourceLabel) {
      this._videoSourceLabel.textContent = sceneDetectionText("input.videoSource");
    }
    if (this._refPlaceholder) {
      this._refPlaceholder.textContent = this._videoSource?.name || (this._videoSource ? sceneDetectionText("input.videoSource") : sceneDetectionText("input.dropVideoHere"));
    }
    if (this._sensitivityLabel) {
      this._sensitivityLabel.textContent = sceneDetectionText("settings.sensitivity");
    }
    if (this._sensitivityLow) {
      this._sensitivityLow.textContent = sceneDetectionText("settings.low");
    }
    if (this._sensitivityHigh) {
      this._sensitivityHigh.textContent = sceneDetectionText("settings.high");
    }
    if (this._resultsPlaceholder) {
      this._resultsPlaceholder.textContent = sceneDetectionText("results.placeholder");
    }
    if (this._sceneCountPrefix) {
      this._sceneCountPrefix.textContent = sceneDetectionText("results.countPrefix");
    }
    if (this._sceneCountSuffix) {
      this._sceneCountSuffix.textContent = sceneDetectionText("results.countSuffix");
    }
    if (this._autoClipBtn) {
      this._autoClipBtn.textContent = sceneDetectionText("actions.autoClip");
    }
    if (this._exportBtn) {
      this._exportBtn.textContent = sceneDetectionText("actions.exportScenes");
    }
  }
  unmount() {
    this._unsubscribeLocale?.();
    this._unsubscribeLocale = null;
  }
}