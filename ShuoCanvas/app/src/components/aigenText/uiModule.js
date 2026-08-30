import { sanitizePromptHtml } from "../../utils/dom.js";
import { isPreviewModeEnabled, syncPreviewNodeLoading } from "../../modules/previewMode.js";
import { setupPromptBoxResize, syncPromptBoxSizeFromData } from "./promptBoxResizeUi.js";
import { createNodeResizeHandle } from "./nodeResizeUi.js";
import { DEBUG_WRENCH_ICON_HTML, formatFinalApiDebugRequest } from "../../utils/debugRequestPreview.js";
import { getNodeDefaultSize } from "../../services/fileService.js";
import { bindNodeFooterController, bindNodeModelMenuTrigger, closeNodeFooterMenus } from "../shared/nodeFooterControls.js";
import { onLocaleChange, t } from "../../i18n/index.js";
import { flushPromptHtmlCommit, handlePromptPaste, handlePromptSelectAll, schedulePromptHtmlCommit, shouldSubmitPromptByKeyboard } from "../../modules/nodePromptShared.js";
import { shouldSkipPromptTriggerForBulkInput } from "../../modules/promptTriggerComposition.js";
import { renderAIGenTextModelSelectorMarkup } from "./modelSelector.js";
import { renderMarkdownToHtml } from "./markdownRenderer.js";
import { bindReadonlyTextSelection } from "./readonlyTextSelection.js";
import { createPromptPresetTriggerController } from "../promptPresetTrigger.js";
import { createModelProviderProfileControl } from "../shared/modelProviderProfileControl.js";
import { buildModelProviderProfileSelectionPatch } from "../../modules/modelProviderProfileSelection.js";
import { bindModelCredentialMenu, syncModelCredentialMenu } from "../../modules/modelCredentialUi.js";
export function createAIGenTextNodeUiModule(_0x5d567c) {
  const {
    store: _0x14118c,
    api: _0x1f4f73,
    getDisplayModelName: _0x3f617c,
    ensureThumbDecoded: _0xccf9ac,
    revealRefThumbMedia: _0x4edae4,
    commit: _0x24509b,
    TEXT_TOOLBAR_HTML: _0x432d24,
    bindTextToolbarEvents: _0x348134,
    getPromptPresets: _0x3593a1,
    openCustomPresetsManager: _0x3a0371,
    startLoading: _0x46edd8,
    stopLoading: _0x33b400,
    bindRefThumbHoverPreview: _0x47d258,
    checkSlashTrigger: _0x5401f4,
    handleSlashKeyboardNavigation: _0x14c539,
    closeSlashMenu: _0x1f5fd5,
    activateMenuKeyboard: _0x512dd7,
    _checkAtTrigger: _0x27d2fa,
    _populateMentionMenu: _0x96ad1f,
    _handleMentionMenuKeyboard: _0x45505b,
    _handlePillKeyboard: _0x2fc73e,
    _rehydratePromptPills: _0x4d12c3,
    _handlePillHover: _0x58759e,
    _handlePillOut: _0x25e037,
    _syncEdgesOrderFromPills: _0x24c05f,
    _syncPillLabels: _0x5e4b2e,
    getCustomTextModels: _0x31174e,
    saveCustomTextModels: _0x178756
  } = _0x5d567c;
  const _0x42fa5e = () => typeof _0x14118c.getStateRaw === "function" ? _0x14118c.getStateRaw() : _0x14118c.getState();
  const _0x5d9c41 = 120;
  class _0x279f8a {
    mount() {
      const _0x3c5c95 = document.createElement("div");
      _0x3c5c95.className = "aigen-node-root aigen-text-node-root";
      this._root = _0x3c5c95;
      _0x3c5c95.innerHTML = _0x432d24;
      this.previewEl = document.createElement("div");
      this.previewEl.className = "img-node-preview aigen-node-preview-fill aigen-text-preview";
      this.outputEl = document.createElement("div");
      this.outputEl.className = "text-output-content aigen-text-output";
      this.outputEl.setAttribute("contenteditable", "false");
      const _0x1c51fd = document.createElement("div");
      _0x1c51fd.className = "img-node-placeholder aigen-media-placeholder aigen-text-placeholder";
      _0x1c51fd.textContent = t("aigenText.previewPlaceholder");
      this._placeholderEl = _0x1c51fd;
      this.previewEl.appendChild(this.outputEl);
      this.previewEl.appendChild(_0x1c51fd);
      syncPreviewNodeLoading(this.nodeId, this.previewEl, this._getPreviewGenerateButtonLoadingOptions?.());
      this._unbindOutputTextSelection = bindReadonlyTextSelection(this.outputEl, {
        onActivate: () => this._enterOutputEditMode(),
        onDeactivate: () => this._commitOutputScrollTop()
      });
      this.outputEl.addEventListener("blur", () => {
        this.outputEl.setAttribute("contenteditable", "false");
        this.outputEl.style.cursor = "";
        this._commitOutputScrollTop();
      });
      this.outputEl.addEventListener("wheel", _0x556e13 => {
        _0x556e13.stopPropagation();
      }, {
        passive: false
      });
      this.outputEl.addEventListener("scroll", () => {
        this._markOutputScrollTopDirty();
      });
      if (this._data.outputText) {
        this._renderOutputText(this._data.outputText);
      }
      this.outputEl.scrollTop = this._outputScrollTop;
      _0x3c5c95.appendChild(this.previewEl);
      const _0x4d34c6 = document.createElement("div");
      _0x4d34c6.className = "text-prompt-panel";
      this._promptPanel = _0x4d34c6;
      this._modelProviderProfileControl?.remove?.();
      this._modelProviderProfileControl = createModelProviderProfileControl({
        panel: _0x4d34c6,
        getNodeData: () => _0x42fa5e().nodes?.[this.nodeId] || this._data || {},
        onChange: _0x22bb13 => _0x14118c.updateNodeData(this.nodeId, _0x22bb13)
      });
      _0x4d34c6.addEventListener("pointerdown", _0x6a93c4 => {
        _0x6a93c4.stopPropagation();
      });
      _0x4d34c6.addEventListener("dblclick", _0x4f295b => {
        if (!_0x4f295b.target.closest(".prompt-textarea") && !_0x4f295b.target.closest(".text-output-content")) {
          _0x4f295b.preventDefault();
          _0x4f295b.stopPropagation();
        }
      });
      this.refBarEl = document.createElement("div");
      this.refBarEl.className = "node-ref-bar";
      _0x4d34c6.appendChild(this.refBarEl);
      this.refBarEl.addEventListener("click", _0x1aedbd => {
        const _0x5142b4 = _0x1aedbd.target.closest(".ref-thumb-delete");
        if (_0x5142b4) {
          _0x1aedbd.stopPropagation();
          _0x1aedbd.preventDefault();
          const _0x134de5 = _0x5142b4.closest(".ref-thumb-wrap")?.dataset.edgeId;
          if (_0x134de5) {
            _0x14118c.removeEdge(_0x134de5);
          }
          return;
        }
        const _0x1db783 = _0x1aedbd.target.closest(".prompt-attachment-btn");
        if (!_0x1db783) {
          return;
        }
        if (_0x1aedbd._pickConnectHandled) {
          return;
        }
        _0x1aedbd.stopPropagation();
        _0x1aedbd.preventDefault();
        const _0xca7931 = _0x14118c.getState().pickConnectMode;
        if (_0xca7931 && _0xca7931.active && _0xca7931.sourceNodeId === this.nodeId) {
          _0x14118c.setPickConnectMode({
            active: false
          });
        } else {
          _0x14118c.setPickConnectMode({
            active: true,
            sourceNodeId: this.nodeId,
            handleDirection: "left"
          });
        }
      });
      this.refBarEl.addEventListener("pointerdown", _0x1e62bb => {
        if (_0x1e62bb.target.closest(".prompt-attachment-btn, .ref-thumb-delete")) {
          _0x1e62bb.stopPropagation();
        }
      });
      this._unbindRefThumbHoverPreview = _0x47d258(this.refBarEl);
      const _0x273fc2 = document.createElement("div");
      _0x273fc2.className = "prompt-input-wrapper";
      _0x273fc2.classList.add("is-resizable");
      this._promptInputWrap = _0x273fc2;
      this.promptEl = document.createElement("div");
      this.promptEl.className = "prompt-textarea custom-textarea";
      this.promptEl.contentEditable = "true";
      this.promptEl.spellcheck = false;
      this.promptEl.dataset.placeholder = t("aigenText.promptPlaceholder");
      if (!document.head.querySelector("#v2-gen-node-css")) {
        const _0xd7c6d6 = document.createElement("style");
        _0xd7c6d6.id = "v2-gen-node-css";
        _0xd7c6d6.textContent = "\n                .prompt-textarea:empty::before {\n                    content: attr(data-placeholder);\n                    color: var(--text-placeholder);\n                    pointer-events: none;\n                }\n                .ref-pill {\n                    display: inline-flex; align-items: center; gap: 3px;\n                    background: transparent; border: none;\n                    border-radius: 4px; padding: 1px 6px; font-size: 14px;\n                    color: var(--text-secondary); cursor: var(--pointer-cursor); user-select: text; -webkit-user-select: text; font-weight: 500;\n                    vertical-align: middle;\n                }\n                .ref-pill .pill-del {\n                    font-size: 16px; color: var(--text-muted);\n                    cursor: var(--link-cursor); margin-left: 2px; line-height: 1;\n                }\n                .ref-pill .pill-del:hover { color: var(--red); }\n                .ref-thumb-wrap.dragging { opacity: 0.3; }\n                .v2-slash-item {\n                    display: flex; flex-direction: column; justify-content: center;\n                    padding: 10px 12px; border-radius: 12px; cursor: var(--link-cursor);\n                    background: transparent; border: none;\n                    transition: all 0.2s; position: relative; height: 54px; overflow: hidden; box-sizing: border-box;\n                }\n                .v2-slash-item:hover, .v2-slash-item.active { background: var(--white-05); }\n                .v2-slash-title {\n                    color: var(--text-primary); font-size: 13px; font-weight: 600;\n                    transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);\n                    transform: translateY(10px);\n                }\n                .v2-slash-desc {\n                    color: var(--text-muted); font-size: 11px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; font-family: monospace; margin-top: 4px;\n                    transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.2s;\n                    transform: translateY(16px);\n                    opacity: 0;\n                }\n                .v2-slash-item:hover > .v2-slash-title, .v2-slash-item.active > .v2-slash-title,\n                .v2-slash-item:hover > .v2-slash-desc, .v2-slash-item.active > .v2-slash-desc {\n                    transform: translateY(0);\n                }\n                .v2-slash-item:hover > .v2-slash-desc, .v2-slash-item.active > .v2-slash-desc {\n                    opacity: 1;\n                }\n            ";
        document.head.appendChild(_0xd7c6d6);
      }
      this._flushPromptHtmlCommit = () => flushPromptHtmlCommit(this);
      this.promptEl.addEventListener("input", _0x2c029d => {
        schedulePromptHtmlCommit(this);
        this._checkAtTrigger(_0x2c029d);
        _0x5401f4(_0x2c029d, {
          promptEl: this.promptEl,
          nodeType: this._data.type,
          nodeId: this.nodeId,
          onGenerate: (_0x38f57e, _0x4f9294) => this._onGenerate(_0x38f57e, _0x4f9294)
        });
        if (shouldSkipPromptTriggerForBulkInput(_0x2c029d)) {
          return;
        }
        _0x24c05f(this);
        this._updateSubmitButtonState();
      });
      this.promptEl.addEventListener("blur", () => {
        flushPromptHtmlCommit(this);
      });
      this.promptEl.addEventListener("mouseover", _0x5c0b81 => _0x58759e(_0x5c0b81, this));
      this.promptEl.addEventListener("mouseout", _0x1a6a97 => _0x25e037(_0x1a6a97, this));
      this.promptEl.addEventListener("keydown", _0x2912f9 => {
        if (handlePromptSelectAll(this, _0x2912f9)) {
          return;
        }
        if (_0x45505b(_0x2912f9)) {
          return;
        }
        if (_0x14c539(_0x2912f9)) {
          return;
        }
        if (shouldSubmitPromptByKeyboard(_0x2912f9)) {
          _0x2912f9.preventDefault();
          flushPromptHtmlCommit(this);
          this.btnEl?.click();
          return;
        }
        _0x2fc73e(this, _0x2912f9);
      });
      this.promptEl.addEventListener("paste", _0x427f6a => {
        handlePromptPaste(this, _0x427f6a);
      });
      if (this._data.prompt) {
        this.promptEl.innerHTML = sanitizePromptHtml(this._data.prompt);
        _0x4d12c3(this);
      }
      _0x273fc2.appendChild(this.promptEl);
      this._syncPromptBoxSizeFromData(this._data);
      this._setupPromptBoxResize();
      _0x4d34c6.appendChild(_0x273fc2);
      this._promptPresetTrigger?.remove?.();
      this._promptPresetTrigger = createPromptPresetTriggerController({
        panel: _0x4d34c6,
        getPromptEl: () => this.promptEl,
        getNodeType: () => this._data?.type,
        getNodeId: () => this.nodeId,
        onGenerate: (_0x13500d, _0x4f90f6) => this._onGenerate(_0x13500d, _0x4f90f6)
      });
      const _0x4ad8a2 = document.createElement("div");
      _0x4ad8a2.className = "prompt-panel-footer";
      const _0x5cb15e = String(this._data.provider || "").trim().toLowerCase();
      const _0x2deac5 = this._data.model || "apimart/kimi-k2-instruct";
      _0x4ad8a2.innerHTML = "\n          " + renderAIGenTextModelSelectorMarkup({
        modelId: _0x2deac5,
        provider: _0x5cb15e,
        providerProfileId: this._data.providerProfileId,
        getDisplayModelName: _0x3f617c
      }) + "\n          <div class=\"prompt-actions\">\n            <button type=\"button\" class=\"prompt-submit debug-wrench-btn\" title=\"" + t("aigenText.debugApiParams") + "\" data-aigen-text-title=\"debugApiParams\">\n              " + DEBUG_WRENCH_ICON_HTML + "\n            </button>\n            <button type=\"button\" class=\"prompt-submit img-gen-btn\" title=\"" + t("aigenText.generate") + "\" data-aigen-text-title=\"generate\">\n              <svg width=\"14\" height=\"14\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><line x1=\"12\" y1=\"19\" x2=\"12\" y2=\"5\"/><polyline points=\"5 12 12 5 19 12\"/></svg>\n            </button>\n          </div>";
      this.modelWrap = _0x4ad8a2.querySelector(".img-model-wrap");
      this.btnEl = _0x4ad8a2.querySelector(".img-gen-btn");
      const _0x3057c9 = _0x4ad8a2.querySelector(".debug-wrench-btn");
      this._syncAigenTextLocale = () => {
        if (this._placeholderEl) {
          this._placeholderEl.textContent = t("aigenText.previewPlaceholder");
        }
        if (this.promptEl) {
          this.promptEl.dataset.placeholder = t("aigenText.promptPlaceholder");
        }
        _0x4ad8a2.querySelector("[data-aigen-text-locale=\"customModelTitle\"]")?.replaceChildren(document.createTextNode(t("aigenText.customModelTitle")));
        _0x4ad8a2.querySelector("[data-aigen-text-locale=\"customModelSubtitle\"]")?.replaceChildren(document.createTextNode(t("aigenText.customModelSubtitle")));
        _0x3057c9?.setAttribute("title", t("aigenText.debugApiParams"));
        this.btnEl?.setAttribute("title", t("aigenText.generate"));
        this._lastRefHTML = "";
        this._renderRefBar?.();
        this._updateSubmitButtonState?.();
        this._renderCustomTextModelSubmenu?.();
      };
      this._unbindLocaleChange?.();
      this._unbindLocaleChange = onLocaleChange(() => this._syncAigenTextLocale?.());
      this._syncAigenTextLocale();
      const _0x499773 = _0x4ad8a2.querySelector(".img-model-btn-trigger");
      const _0x38b523 = _0x4ad8a2.querySelector(".img-model-menu");
      const _0xa65f44 = _0x4ad8a2.querySelector(".img-model-label");
      const _0x5883b5 = _0x38b523?.querySelector(".grsai-submenu");
      const _0x3bd459 = _0x38b523?.querySelector(".ppio-submenu");
      const _0x3386ac = _0x38b523?.querySelector(".apimart-submenu");
      const _0x885222 = _0x38b523?.querySelector(".agnes-submenu");
      const _0x483446 = _0x38b523?.querySelector(".runninghub-submenu");
      const _0x3222af = _0x38b523?.querySelector(".volcengine-submenu");
      const _0x32edda = Object.freeze({
        grsai: _0x5883b5,
        ppio: _0x3bd459,
        apimart: _0x3386ac,
        agnes: _0x885222,
        runninghub: _0x483446,
        volcengine: _0x3222af
      });
      const _0x318dbb = _0x48cdc6 => {
        const _0x52d915 = _0x48cdc6?.querySelector("img, svg, div");
        const _0x4da552 = _0x499773?.firstElementChild;
        if (!_0x4da552 || !_0x52d915 || _0x52d915.classList.contains("fmi-content")) {
          return;
        }
        const _0x11f60a = _0x52d915.cloneNode(true);
        _0x11f60a.removeAttribute?.("style");
        _0x11f60a.classList?.remove("text-model-icon", "node-menu-icon");
        _0x11f60a.classList?.add("text-model-icon-small");
        if (_0x11f60a.tagName?.toLowerCase() === "svg") {
          _0x11f60a.setAttribute("width", "12");
          _0x11f60a.setAttribute("height", "12");
          _0x11f60a.classList.add("node-menu-icon-small");
        }
        _0x4da552.replaceWith(_0x11f60a);
      };
      const _0x4817ee = (_0x5cc24c, _0x1582ae, _0x3cafe7) => {
        const _0x50413b = _0x5cc24c?.dataset?.value;
        if (!_0x50413b) {
          return;
        }
        const _0x4650fe = _0x5cc24c.dataset.provider || _0x1582ae;
        const _0x352089 = _0x14118c.getState().nodes?.[this.nodeId] || this._data || {};
        const _0x288de4 = buildModelProviderProfileSelectionPatch(_0x352089, _0x50413b, _0x5cc24c?.dataset?.credentialResolvedProviderProfileId);
        const _0x14039a = _0x5cc24c.querySelector(".fmi-title") || _0x5cc24c.querySelector(".floating-menu-label");
        _0xa65f44.textContent = _0x14039a ? _0x14039a.textContent : _0x50413b;
        _0x38b523.querySelectorAll(".floating-menu-item").forEach(_0x483ffd => _0x483ffd.classList.remove("active"));
        _0x5cc24c.classList.add("active");
        _0x38b523.classList.remove("show");
        if (_0x3cafe7) {
          _0x3cafe7.style.display = "none";
        }
        _0x14118c.updateNodeData(this.nodeId, {
          model: _0x50413b,
          provider: _0x4650fe,
          ..._0x288de4
        });
        _0x318dbb(_0x5cc24c);
      };
      _0x38b523?.addEventListener("click", _0x56f67e => {
        const _0x1452fe = _0x56f67e.target?.closest?.(".floating-menu-item");
        if (!_0x1452fe || !_0x38b523.contains(_0x1452fe)) {
          return;
        }
        const _0x112b6c = Object.entries(_0x32edda);
        const _0x462c53 = _0x112b6c.find(([, _0x328fe0]) => _0x328fe0?.contains(_0x1452fe)) || (_0x1452fe.dataset.provider ? [String(_0x1452fe.dataset.provider || ""), _0x1452fe.closest(".node-model-submenu")] : null);
        if (!_0x462c53) {
          return;
        }
        _0x56f67e.stopPropagation();
        _0x4817ee(_0x1452fe, _0x462c53[0], _0x462c53[1]);
      });
      _0x3057c9?.addEventListener("click", async _0x5b3e38 => {
        _0x5b3e38.stopPropagation();
        flushPromptHtmlCommit(this);
        let _0x3bdbbc;
        if (typeof this._buildPayload === "function") {
          _0x3bdbbc = await this._buildPayload();
        } else {
          const _0x2ecd36 = this.promptEl?.innerText?.trim() || "";
          _0x3bdbbc = {
            prompt: _0x2ecd36,
            nodeType: this._data.type
          };
        }
        if (!_0x3bdbbc) {
          return;
        }
        try {
          const _0x4e1c5c = await _0x1f4f73.buildGenerateTextRequest(_0x3bdbbc);
          const _0x391ca8 = formatFinalApiDebugRequest(_0x4e1c5c);
          const _0x267d65 = _0x14118c.getState();
          const _0x31cccd = this._data.x + (this._data.width || 380) + 50;
          const _0x6fd803 = this._data.y;
          const _0xc90c0c = getNodeDefaultSize("debug");
          let _0x140661 = Object.values(_0x267d65.nodes).find(_0xd21652 => _0xd21652.type === "debug");
          if (!_0x140661) {
            const _0x93b7d1 = "debug-" + Date.now();
            _0x14118c.addNode({
              id: _0x93b7d1,
              type: "debug",
              x: _0x31cccd,
              y: _0x6fd803,
              ..._0xc90c0c,
              name: t("aigenText.debug.nodeName"),
              outputText: _0x391ca8
            });
          } else {
            _0x14118c.updateNodeData(_0x140661.id, {
              outputText: _0x391ca8,
              x: _0x31cccd,
              y: _0x6fd803
            });
          }
          window.showToast?.(t("aigenText.debug.paramsShown"), "warn");
        } catch (_0x4500b4) {
          window.showToast?.(t("aigenText.debug.buildRequestFailed", {
            error: _0x4500b4?.message || _0x4500b4
          }), "error");
        }
      });
      this._footerControllerCleanup?.();
      this._footerControllerCleanup = bindNodeFooterController(_0x4ad8a2);
      bindNodeModelMenuTrigger({
        root: _0x4ad8a2,
        trigger: _0x499773,
        menu: _0x38b523,
        closeOthers: () => closeNodeFooterMenus(_0x4ad8a2, _0x38b523),
        activateMenuKeyboard: _0x512dd7
      });
      const _0x5e1033 = {
        listenConfigChanges: false,
        getProviderProfileId: () => {
          const _0x482ef7 = _0x14118c.getState?.()?.nodes?.[this.nodeId] || this._data || {};
          return _0x482ef7.providerProfileId || _0x482ef7.rhProviderProfileId || "";
        }
      };
      this._modelCredentialMenuCleanup?.();
      this._modelCredentialMenuCleanup = bindModelCredentialMenu(_0x38b523, _0x5e1033);
      _0x499773?.addEventListener("click", () => {
        syncModelCredentialMenu(_0x38b523, _0x5e1033);
      });
      const _0x789869 = _0x38b523.querySelector("[data-custom-toggle]");
      const _0x366177 = _0x38b523.querySelector(".custom-submenu");
      let _0x4e2b53 = null;
      const _0x22edbe = () => {
        clearTimeout(_0x4e2b53);
        if (_0x366177) {
          _0x366177.style.display = "flex";
        }
      };
      const _0x11c0b1 = (_0x3f496f = 120) => {
        _0x4e2b53 = setTimeout(() => {
          if (_0x366177 && _0x366177.querySelector("input:focus")) {
            return;
          }
          if (_0x366177) {
            _0x366177.style.display = "none";
          }
        }, _0x3f496f);
      };
      if (_0x789869) {
        _0x789869.addEventListener("mouseenter", _0x22edbe);
        _0x789869.addEventListener("mouseleave", () => _0x11c0b1());
      }
      if (_0x366177) {
        _0x366177.addEventListener("mouseenter", _0x22edbe);
        _0x366177.addEventListener("mouseleave", () => _0x11c0b1());
        _0x366177.addEventListener("click", _0x19891b => _0x19891b.stopPropagation());
        _0x366177.addEventListener("pointerdown", _0x1d2556 => _0x1d2556.stopPropagation());
      }
      const _0x97d7a5 = () => {
        if (!_0x366177) {
          return;
        }
        const _0xd272dd = _0x31174e();
        const _0x4c9363 = this._data.model || "";
        _0x366177.innerHTML = "";
        _0xd272dd.forEach((_0x40cbef, _0x1cdfb7) => {
          const _0x5d5464 = document.createElement("div");
          _0x5d5464.className = "floating-menu-item custom-model-item" + (_0x4c9363 === _0x40cbef ? " active" : "");
          _0x5d5464.dataset.value = _0x40cbef;
          _0x5d5464.innerHTML = "\n                    <div class=\"text-model-icon text-model-icon-badge custom-model-icon\">OA</div>\n                    <span class=\"custom-model-label\">" + _0x40cbef + "</span>\n                    <span class=\"custom-model-del\">×</span>\n                ";
          const _0x48f01a = _0x5d5464.querySelector(".custom-model-del");
          _0x5d5464.addEventListener("mouseenter", () => {
            if (_0x48f01a) {
              _0x48f01a.classList.add("show");
            }
          });
          _0x5d5464.addEventListener("mouseleave", () => {
            if (_0x48f01a) {
              _0x48f01a.classList.remove("show");
            }
          });
          _0x5d5464.addEventListener("click", _0x4def36 => {
            if (_0x4def36.target.closest(".custom-model-del")) {
              return;
            }
            _0xa65f44.textContent = _0x40cbef;
            _0x38b523.querySelectorAll(".floating-menu-item").forEach(_0x22a775 => _0x22a775.classList.remove("active"));
            _0x5883b5?.querySelectorAll(".floating-menu-item").forEach(_0x10dd78 => _0x10dd78.classList.remove("active"));
            _0x3bd459?.querySelectorAll(".floating-menu-item").forEach(_0x4d9248 => _0x4d9248.classList.remove("active"));
            _0x366177.querySelectorAll(".floating-menu-item").forEach(_0x5c22c7 => _0x5c22c7.classList.remove("active"));
            _0x5d5464.classList.add("active");
            _0x38b523.classList.remove("show");
            _0x366177.style.display = "none";
            _0x14118c.updateNodeData(this.nodeId, {
              model: _0x40cbef,
              provider: "custom"
            });
            const _0x80a875 = _0x499773.firstElementChild;
            if (_0x80a875) {
              const _0x11f759 = document.createElementNS("http://www.w3.org/2000/svg", "svg");
              _0x11f759.setAttribute("width", "12");
              _0x11f759.setAttribute("height", "12");
              _0x11f759.setAttribute("viewBox", "0 0 24 24");
              _0x11f759.setAttribute("fill", "none");
              _0x11f759.setAttribute("stroke", "currentColor");
              _0x11f759.setAttribute("stroke-width", "2");
              _0x11f759.innerHTML = "<rect x=\"4\" y=\"4\" width=\"16\" height=\"16\" rx=\"2\" ry=\"2\"/><rect x=\"9\" y=\"9\" width=\"6\" height=\"6\"/><line x1=\"9\" y1=\"1\" x2=\"9\" y2=\"4\"/><line x1=\"15\" y1=\"1\" x2=\"15\" y2=\"4\"/><line x1=\"9\" y1=\"20\" x2=\"9\" y2=\"23\"/><line x1=\"15\" y1=\"20\" x2=\"15\" y2=\"23\"/><line x1=\"20\" y1=\"9\" x2=\"23\" y2=\"9\"/><line x1=\"20\" y1=\"14\" x2=\"23\" y2=\"14\"/><line x1=\"1\" y1=\"9\" x2=\"4\" y2=\"9\"/><line x1=\"1\" y1=\"14\" x2=\"4\" y2=\"14\"/>";
              _0x80a875.replaceWith(_0x11f759);
            }
          });
          _0x48f01a?.addEventListener("click", _0x5b4069 => {
            _0x5b4069.stopPropagation();
            const _0x8bef1f = _0x31174e().filter((_0x2f17f1, _0x1ea8d8) => _0x1ea8d8 !== _0x1cdfb7);
            _0x178756(_0x8bef1f);
            _0x97d7a5();
          });
          _0x366177.appendChild(_0x5d5464);
        });
        if (_0xd272dd.length > 0) {
          const _0x4d38dc = document.createElement("div");
          _0x4d38dc.className = "custom-model-separator";
          _0x366177.appendChild(_0x4d38dc);
        }
        const _0x429aff = document.createElement("div");
        _0x429aff.className = "floating-menu-item custom-model-add";
        _0x429aff.innerHTML = "\n                <svg class=\"custom-model-add-icon\" width=\"14\" height=\"14\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><line x1=\"12\" y1=\"5\" x2=\"12\" y2=\"19\"/><line x1=\"5\" y1=\"12\" x2=\"19\" y2=\"12\"/></svg>\n                <span class=\"custom-model-add-label\">" + t("aigenText.customModel.addModel") + "</span>\n            ";
        _0x429aff.addEventListener("click", _0x3b43f0 => {
          _0x3b43f0.stopPropagation();
          _0x429aff.innerHTML = "";
          _0x429aff.classList.add("editing");
          const _0x49304b = document.createElement("input");
          _0x49304b.type = "text";
          _0x49304b.placeholder = t("aigenText.customModel.namePlaceholder");
          _0x49304b.className = "custom-model-input";
          const _0x1d967a = document.createElement("button");
          _0x1d967a.type = "button";
          _0x1d967a.textContent = t("aigenText.customModel.confirm");
          _0x1d967a.className = "custom-model-confirm";
          const _0x660ca4 = () => {
            const _0x4e9ec5 = _0x49304b.value.trim();
            if (!_0x4e9ec5) {
              return;
            }
            const _0x35ae57 = _0x31174e();
            if (!_0x35ae57.includes(_0x4e9ec5)) {
              _0x35ae57.push(_0x4e9ec5);
              _0x178756(_0x35ae57);
            }
            _0x97d7a5();
          };
          _0x49304b.addEventListener("keydown", _0x544034 => {
            _0x544034.stopPropagation();
            if (_0x544034.key === "Enter") {
              _0x660ca4();
            }
          });
          _0x49304b.addEventListener("keyup", _0x1a51d3 => _0x1a51d3.stopPropagation());
          _0x49304b.addEventListener("keypress", _0x101e89 => _0x101e89.stopPropagation());
          _0x49304b.addEventListener("click", _0x4d14e4 => _0x4d14e4.stopPropagation());
          _0x1d967a.addEventListener("click", _0x542b3a => {
            _0x542b3a.stopPropagation();
            _0x660ca4();
          });
          _0x429aff.appendChild(_0x49304b);
          _0x429aff.appendChild(_0x1d967a);
          _0x49304b.focus();
        });
        _0x366177.appendChild(_0x429aff);
      };
      this._renderCustomTextModelSubmenu = _0x97d7a5;
      _0x97d7a5();
      this.btnEl.addEventListener("click", () => {
        flushPromptHtmlCommit(this);
        this._onGenerate();
      });
      _0x4d34c6.appendChild(_0x4ad8a2);
      _0x3c5c95.appendChild(_0x4d34c6);
      this._renderRefBar();
      const _0xfbc9e5 = _0x3c5c95.querySelector(".node-floating-toolbar");
      _0x348134(_0xfbc9e5, this._data, () => this._getOutputRawText?.() || "");
      const _0x29dab5 = createNodeResizeHandle(this, {
        store: _0x14118c,
        getStateSnapshot: _0x42fa5e,
        commit: _0x24509b
      });
      _0x3c5c95.appendChild(_0x29dab5);
      this._updateSubmitButtonState();
      return _0x3c5c95;
    }
    _enterOutputEditMode() {
      if (this.outputEl) {
        this.outputEl.setAttribute("contenteditable", "false");
      }
      this._commitOutputScrollTop();
      const _0x58e23e = _0x14118c.getState().selectedNodeIds;
      if (!_0x58e23e.includes(this.nodeId)) {
        _0x14118c.setSelectedNodes([this.nodeId]);
      }
    }
    _captureOutputScrollTop() {
      this._outputScrollTop = Math.max(0, Number(this.outputEl?.scrollTop || 0));
      return this._outputScrollTop;
    }
    _markOutputScrollTopDirty() {
      this._captureOutputScrollTop();
      this._outputScrollTopDirty = true;
      this._scheduleOutputScrollTopCommit();
    }
    _scheduleOutputScrollTopCommit() {
      if (this._outputScrollTopCommitTimer) {
        clearTimeout(this._outputScrollTopCommitTimer);
      }
      this._outputScrollTopCommitTimer = setTimeout(() => {
        this._outputScrollTopCommitTimer = null;
        this._commitOutputScrollTop();
      }, _0x5d9c41);
    }
    _commitOutputScrollTop() {
      if (!this.outputEl || !this.nodeId) {
        return 0;
      }
      if (this._outputScrollTopCommitTimer) {
        clearTimeout(this._outputScrollTopCommitTimer);
        this._outputScrollTopCommitTimer = null;
      }
      const _0x13b249 = this._captureOutputScrollTop();
      this._outputScrollTopDirty = false;
      const _0x2a4f38 = typeof _0x14118c.getStateRaw === "function" ? _0x14118c.getStateRaw()?.nodes?.[this.nodeId] : _0x14118c.getState?.()?.nodes?.[this.nodeId];
      if (Number(_0x2a4f38?.outputScrollTop) === _0x13b249) {
        return _0x13b249;
      }
      if (typeof _0x14118c.updateNodeData === "function") {
        _0x14118c.updateNodeData(this.nodeId, {
          outputScrollTop: _0x13b249
        });
      }
      return _0x13b249;
    }
    _getOutputRawText(_0x26eb4a = this._data) {
      const _0x5e4adb = typeof this.nodeId === "string" ? this.nodeId : "";
      const _0x5dbfb6 = _0x5e4adb && typeof _0x14118c.getStateRaw === "function" ? _0x14118c.getStateRaw()?.nodes?.[_0x5e4adb] : null;
      return String(_0x5dbfb6?.outputText ?? _0x26eb4a?.outputText ?? "");
    }
    _renderOutputText(_0x4e3253 = this._getOutputRawText()) {
      if (!this.outputEl) {
        return;
      }
      const _0x2c6c1f = String(_0x4e3253 ?? "");
      this._lastRenderedOutputText = _0x2c6c1f;
      if (!_0x2c6c1f) {
        this.outputEl.replaceChildren();
        this.outputEl.style.display = "none";
        if (this._placeholderEl) {
          this._placeholderEl.style.display = "flex";
        }
        return;
      }
      this.outputEl.innerHTML = renderMarkdownToHtml(_0x2c6c1f);
      this.outputEl.style.display = "block";
      if (this._placeholderEl) {
        this._placeholderEl.style.display = "none";
      }
    }
    _handlePreviewDblclick(_0x3a747a) {
      if (!isPreviewModeEnabled()) {
        return;
      }
      _0x3a747a?.stopPropagation?.();
    }
    _syncPromptBoxSizeFromData(_0x310f5c = this._data) {
      syncPromptBoxSizeFromData(this, _0x310f5c);
    }
    _setupPromptBoxResize() {
      setupPromptBoxResize(this, {
        store: _0x14118c,
        getStateSnapshot: _0x42fa5e
      });
    }
  }
  return _0x279f8a.prototype;
}