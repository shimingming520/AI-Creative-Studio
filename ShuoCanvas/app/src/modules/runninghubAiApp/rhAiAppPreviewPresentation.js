export function createRhAiAppPreviewPresentation({
  readState = () => ({}),
  writeState = () => {},
  actions = {},
  primitives = {},
  windowObject = globalThis.window || globalThis,
  documentObject = globalThis.document
} = {}) {
  const {
    OUTPUT_KIND_LABELS: _0x59b35d,
    RH_AI_APP_EXIT_MOTION_MS: _0x5078ef,
    bindUiSchemaFieldControls: _0x3bdb32,
    buildPreviewUiSchemaNodeData: _0x1c74d8,
    canPreviewPromptBecomeParam: _0x417bb7,
    getBundleParamFields: _0x2a74e1,
    getComponentByIndex: _0x10c05a,
    getCustomAiAppComponentIndex: _0x3fe34b,
    getPreviewComponentDescription: _0x12a313,
    getPreviewInstanceText: _0xb99c02,
    getPreviewPromptHelpComponent: _0x9e357b,
    normalizeAppName: _0x5d0cca,
    normalizeComponentKind: _0x58f173,
    normalizeKind: _0x1bede8,
    renderPreviewAdvancedPanelHtml: _0x7a36cd,
    renderPreviewAppMenuHtml: _0x4ed5d2,
    renderPreviewBatchControlsHtml: _0x209b54,
    renderPreviewHomeParamsHtml: _0x50230b,
    renderPreviewInputComponentsHtml: _0x5a8597,
    renderPreviewPromptHelpTipHtml: _0x4f9818,
    renderPreviewTypeBarHtml: _0x4f28de,
    renderRhAiAppNodePreviewHtml: _0xd5a873,
    renderSaveConfigOverwriteMenuHtml: _0x22c6af,
    shouldReduceMotion: _0x515780
  } = primitives;
  const _0x20b091 = windowObject;
  const _0x174a64 = documentObject;
  class _0x2cb779 {
    constructor() {
      this.previewUiSchemaCleanup = null;
    }
    get nodePreviewEl() {
      return readState().nodePreviewEl || null;
    }
    get componentDrafts() {
      return readState().componentDrafts || [];
    }
    get kind() {
      return readState().kind || "image";
    }
    get currentBundle() {
      return readState().currentBundle || null;
    }
    get appName() {
      return readState().appName || "";
    }
    get previewAppMenuOpen() {
      return readState().previewAppMenuOpen === true;
    }
    get pendingDeleteSavedAppId() {
      return readState().pendingDeleteSavedAppId || "";
    }
    get pendingOverwriteSavedAppId() {
      return readState().pendingOverwriteSavedAppId || "";
    }
    get pendingOverwriteIntent() {
      return readState().pendingOverwriteIntent || "";
    }
    get componentDraftKey() {
      return readState().componentDraftKey || "";
    }
    get comfyCandidatePickerOpen() {
      return readState().comfyCandidatePickerOpen === true;
    }
    get comfyCandidateSearchText() {
      return readState().comfyCandidateSearchText || "";
    }
    get saveConfigMenuEl() {
      return readState().saveConfigMenuEl || null;
    }
    get createConfigMenuEl() {
      return readState().createConfigMenuEl || null;
    }
    set componentPickerEl(_0x438f9f) {
      writeState({
        componentPickerEl: _0x438f9f
      });
    }
    _getSavedAppsForKind() {
      return actions.getSavedAppsForKind?.() || [];
    }
    _getSourceMeta() {
      return actions.getSourceMeta?.() || null;
    }
    _shouldShowManualComponentPicker() {
      return actions.shouldShowManualComponentPicker?.() === true;
    }
    _canRemovePreviewParams() {
      return actions.canRemovePreviewParams?.() !== false;
    }
    _canRemovePreviewInputs() {
      return actions.canRemovePreviewInputs?.() !== false;
    }
    _renderComfyCandidatePicker(_0x5d53a5 = {}) {
      return actions.renderComfyCandidatePicker?.(_0x5d53a5);
    }
    _findSavedApp(_0x636527) {
      return actions.findSavedApp?.(_0x636527) || null;
    }
    _commitPreviewUiSchemaValue(_0xc7bcd, _0x5b968e) {
      return actions.commitPreviewUiSchemaValue?.(_0xc7bcd, _0x5b968e);
    }
    _renderNodePreview(_0x285f23 = this.currentBundle) {
      if (!this.nodePreviewEl) {
        return;
      }
      this.clearUiSchemaBinding();
      this.nodePreviewEl.innerHTML = _0xd5a873({
        components: this.componentDrafts,
        kind: this.kind,
        bundle: _0x285f23,
        appName: this.appName,
        savedApps: this._getSavedAppsForKind(),
        isAppMenuOpen: this.previewAppMenuOpen,
        pendingDeleteSavedAppId: this.pendingDeleteSavedAppId,
        pendingOverwriteSavedAppId: this.pendingOverwriteSavedAppId,
        pendingOverwriteIntent: this.pendingOverwriteIntent,
        sourceLabel: this._getSourceMeta()?.label || "RH AI应用",
        runningHubProfileLabel: readState().runningHubProfileLabel || "",
        showComfyAddPanel: this._shouldShowManualComponentPicker(),
        canAddComfyComponents: Boolean(this.componentDraftKey),
        comfyCandidatePickerOpen: this.comfyCandidatePickerOpen,
        comfyCandidateSearchText: this.comfyCandidateSearchText,
        comfyCandidateEmptyText: "点击添加组件，逐行选择要暴露到节点上的工作流输入。",
        canRemovePreviewParams: this._canRemovePreviewParams(),
        canRemovePreviewInputs: this._canRemovePreviewInputs()
      });
      this.componentPickerEl = this.nodePreviewEl?.querySelector?.("[data-role='comfyui-candidate-menu']");
      this._renderComfyCandidatePicker({
        open: this.comfyCandidatePickerOpen
      });
      this._decoratePreviewAdvancedFields(_0x285f23);
      this._bindPreviewUiSchemaControls();
    }
    _closePreviewAppMenuElement(_0x1aa6da) {
      if (!_0x1aa6da) {
        return;
      }
      if (_0x515780()) {
        _0x1aa6da.remove();
        return;
      }
      _0x1aa6da.classList.add("is-closing");
      _0x1aa6da.setAttribute("aria-hidden", "true");
      _0x20b091.setTimeout(() => {
        if (_0x1aa6da.classList?.contains("is-closing")) {
          _0x1aa6da.remove();
        }
      }, _0x5078ef);
    }
    _patchPreviewAppChrome() {
      this._patchSaveConfigMenu();
      this._patchCreateConfigMenu();
      const _0x53ec10 = this.nodePreviewEl?.querySelector?.(".rh-ai-app-preview-node .img-model-wrap");
      if (!_0x53ec10) {
        return false;
      }
      const _0x61f4e3 = _0x53ec10.querySelector(".rh-ai-app-preview-model-trigger");
      const _0xd1f321 = _0x53ec10.querySelector(".img-model-label");
      if (_0xd1f321) {
        _0xd1f321.textContent = _0x5d0cca(this.appName);
      }
      actions.syncRunningHubProfileBadge?.(_0x53ec10);
      if (_0x61f4e3) {
        _0x61f4e3.setAttribute("aria-expanded", this.previewAppMenuOpen ? "true" : "false");
      }
      const _0x76ba08 = _0x53ec10.querySelector("[data-role='saved-app-menu']");
      if (!this.previewAppMenuOpen) {
        this._closePreviewAppMenuElement(_0x76ba08);
        return true;
      }
      _0x76ba08?.remove();
      const _0x3f812d = _0x4ed5d2({
        appName: this.appName,
        savedApps: this._getSavedAppsForKind(),
        isOpen: this.previewAppMenuOpen,
        pendingDeleteSavedAppId: this.pendingDeleteSavedAppId,
        pendingOverwriteSavedAppId: this.pendingOverwriteSavedAppId,
        pendingOverwriteIntent: this.pendingOverwriteIntent,
        sourceLabel: this._getSourceMeta()?.label || "RH AI应用"
      });
      if (_0x3f812d && _0x61f4e3) {
        _0x61f4e3.insertAdjacentHTML("afterend", _0x3f812d);
      }
      return true;
    }
    _patchSaveConfigMenu() {
      return this._patchFooterOverwriteMenu(this.saveConfigMenuEl, "save");
    }
    _patchCreateConfigMenu() {
      return this._patchFooterOverwriteMenu(this.createConfigMenuEl, "create");
    }
    _patchFooterOverwriteMenu(_0x459d4f, _0x23df1f) {
      if (!_0x459d4f) {
        return false;
      }
      const _0x478ad2 = this.pendingOverwriteIntent === _0x23df1f && Boolean(this.pendingOverwriteSavedAppId);
      const _0x1dc171 = _0x478ad2 ? this._findSavedApp(this.pendingOverwriteSavedAppId) : null;
      if (!_0x1dc171) {
        _0x459d4f.hidden = true;
        _0x459d4f.setAttribute("aria-hidden", "true");
        _0x459d4f.innerHTML = "";
        return true;
      }
      _0x459d4f.hidden = false;
      _0x459d4f.setAttribute("aria-hidden", "false");
      _0x459d4f.innerHTML = _0x22c6af({
        savedApp: _0x1dc171,
        intent: _0x23df1f
      });
      return true;
    }
    _patchPreviewPromptArea() {
      const _0x1c97df = this.nodePreviewEl?.querySelector?.(".rh-ai-app-preview-input");
      const _0x511074 = _0x1c97df?.querySelector?.(".rh-ai-app-preview-prompt");
      const _0x481821 = _0x1c97df?.closest?.(".rh-ai-app-real-preview-panel");
      if (!_0x1c97df || !_0x511074) {
        return false;
      }
      const _0x4b0e6b = this.componentDrafts.find(_0x52c8ef => _0x58f173(_0x52c8ef?.componentKind) === "prompt");
      const _0x3d9251 = _0x9e357b(this.componentDrafts);
      const _0x530249 = (_0x4b0e6b || _0x3d9251)?.label ? "填写" + (_0x4b0e6b || _0x3d9251).label + "，按 @ 引用素材，/呼出指令..." : "描述" + (_0x59b35d[this.kind] || "生成") + "内容，按 @ 引用素材，/呼出指令...";
      const _0x32faa5 = Number(_0x4b0e6b?.index);
      const _0x1ab728 = Number.isInteger(_0x32faa5);
      const _0x4a2a8d = _0x1ab728 && _0x417bb7(_0x4b0e6b);
      _0x1c97df.classList.add("rh-ai-app-preview-prompt-zone");
      _0x1c97df.classList.toggle("rh-ai-app-preview-prompt-target", _0x1ab728);
      _0x1c97df.classList.toggle("rh-ai-app-preview-draggable", _0x4a2a8d);
      _0x1c97df.classList.toggle("rh-ai-app-preview-prompt-draggable", _0x4a2a8d);
      _0x1c97df.dataset.previewZone = "prompt";
      if (_0x1ab728) {
        _0x1c97df.dataset.previewComponentIndex = String(_0x32faa5);
      } else {
        delete _0x1c97df.dataset.previewComponentIndex;
      }
      if (_0x4a2a8d) {
        _0x1c97df.dataset.previewDragKind = "prompt";
      } else {
        delete _0x1c97df.dataset.previewDragKind;
      }
      const _0x34b5f1 = ".rh-ai-app-preview-prompt-help-tip, .rh-ai-app-preview-description-input--prompt";
      this.nodePreviewEl?.querySelectorAll?.(_0x34b5f1).forEach(_0x1d8623 => {
        _0x1d8623.remove();
      });
      Array.from(_0x1c97df.children).filter(_0x2226ac => _0x2226ac.classList?.contains("rh-ai-app-preview-typebar")).forEach(_0x5632fb => _0x5632fb.remove());
      const _0x8a90d5 = _0x4b0e6b ? _0x4f28de(_0x4b0e6b, {
        canRemove: this._canRemovePreviewParams()
      }) : "";
      if (_0x8a90d5) {
        _0x511074.insertAdjacentHTML("beforebegin", _0x8a90d5);
      }
      const _0x21406a = _0x4f9818(_0x3d9251, {
        bundle: this.currentBundle
      });
      if (_0x21406a && _0x481821) {
        _0x481821.insertAdjacentHTML("afterbegin", _0x21406a);
      }
      _0x511074.dataset.placeholder = _0x530249;
      return true;
    }
    _patchPreviewActionControls(_0x40512c = this.currentBundle) {
      const _0x9bbb80 = this.nodePreviewEl?.querySelector?.(".rh-ai-app-preview-node");
      if (!_0x9bbb80) {
        return false;
      }
      const _0x2ac103 = _0xb99c02(_0x40512c);
      const _0x4fd039 = _0x9bbb80.querySelector(".ui-schema-instance-slot");
      if (_0x4fd039) {
        _0x4fd039.hidden = !_0x2ac103;
        const _0x932e0a = _0x4fd039.querySelector(".rh-vram-label");
        if (_0x932e0a) {
          _0x932e0a.textContent = _0x2ac103;
        }
      }
      const _0x42198b = _0x209b54(_0x40512c);
      const _0x29a09b = _0x9bbb80.querySelector(".ui-schema-batch-slot");
      if (_0x29a09b) {
        _0x29a09b.hidden = !_0x42198b;
        if (_0x29a09b.innerHTML !== _0x42198b) {
          _0x29a09b.innerHTML = _0x42198b;
        }
      }
      return true;
    }
    _patchPreviewWithoutRebuild(_0x586b2c = this.currentBundle, {
      renderInputs = false,
      renderParams = false,
      renderAdvanced = false,
      renderPrompt = false,
      renderAppChrome = false,
      renderActionControls = false
    } = {}) {
      const _0x155869 = this.nodePreviewEl?.querySelector?.(".rh-ai-app-preview-node");
      if (!_0x155869) {
        this._renderNodePreview(_0x586b2c);
        return false;
      }
      _0x155869.dataset.previewNodeKind = _0x1bede8(this.kind);
      if (renderAppChrome) {
        this._patchPreviewAppChrome();
      }
      if (renderPrompt) {
        this._patchPreviewPromptArea();
      }
      if (renderActionControls) {
        this._patchPreviewActionControls(_0x586b2c);
      }
      if (renderInputs || renderParams || renderAdvanced) {
        this._renderPreviewMutableZones(_0x586b2c, {
          renderInputs: renderInputs,
          renderParams: renderParams,
          renderAdvanced: renderAdvanced
        });
      }
      return true;
    }
    _renderPreviewMutableZones(_0x5e025f = this.currentBundle, {
      renderInputs = false,
      renderParams = true,
      renderAdvanced = true
    } = {}) {
      if (!this.nodePreviewEl) {
        return;
      }
      const _0x96e1da = this._getPreviewZoneElement("input");
      if (renderInputs && _0x96e1da) {
        _0x96e1da.innerHTML = _0x5a8597(this.componentDrafts, {
          canRemovePreviewInputs: this._canRemovePreviewInputs()
        });
      }
      const _0x5e5c2e = this._getPreviewZoneElement("params");
      if (renderParams && _0x5e5c2e) {
        _0x5e5c2e.innerHTML = _0x50230b(this.componentDrafts, _0x5e025f, {
          canRemovePreviewParams: this._canRemovePreviewParams()
        });
      }
      if (renderAdvanced) {
        const _0x2c3387 = _0x7a36cd({
          components: this.componentDrafts,
          bundle: _0x5e025f
        });
        const _0x58ad57 = this.nodePreviewEl.querySelector(".rh-ai-app-real-preview-panel");
        const _0x72371b = this._getPreviewZoneElement("advanced");
        this.clearUiSchemaBinding();
        if (_0x72371b) {
          if (_0x2c3387) {
            _0x72371b.outerHTML = _0x2c3387;
          } else {
            _0x72371b.remove();
          }
        } else if (_0x2c3387 && _0x58ad57) {
          _0x58ad57.insertAdjacentHTML("beforeend", _0x2c3387);
        }
        this._decoratePreviewAdvancedFields(_0x5e025f);
        this._bindPreviewUiSchemaControls();
      } else if (renderParams) {
        this._bindPreviewUiSchemaControls();
      }
    }
    _bindPreviewUiSchemaControls() {
      const _0x3c61a6 = this.nodePreviewEl?.querySelector?.(".rh-ai-app-preview-node");
      if (!_0x3c61a6) {
        return;
      }
      this.clearUiSchemaBinding();
      this.previewUiSchemaCleanup = _0x3bdb32(_0x3c61a6, {
        getNodeData: () => _0x1c74d8(this.currentBundle),
        commitFieldValue: (_0x25d2ee, _0x375e64) => this._commitPreviewUiSchemaValue(_0x25d2ee, _0x375e64)
      });
    }
    _decoratePreviewAdvancedFields(_0x14e6ab = this.currentBundle) {
      const _0x402c45 = _0x2a74e1(_0x14e6ab);
      if (!_0x402c45.length || !this.nodePreviewEl) {
        return;
      }
      _0x402c45.forEach(_0x8e2f13 => {
        const _0x231881 = _0x3fe34b(_0x8e2f13);
        if (!Number.isInteger(_0x231881)) {
          return;
        }
        const _0x39cd92 = String(_0x8e2f13?.id || "").trim();
        if (!_0x39cd92) {
          return;
        }
        const _0x123f55 = Array.from(this.nodePreviewEl.querySelectorAll("[data-ui-schema-field]")).find(_0x57e8e0 => String(_0x57e8e0?.dataset?.uiSchemaField || "") === _0x39cd92);
        if (!_0x123f55) {
          return;
        }
        _0x123f55.classList.add("rh-ai-app-preview-draggable", "rh-ai-app-preview-advanced-param");
        _0x123f55.dataset.previewDragKind = "advanced-param";
        _0x123f55.dataset.previewComponentIndex = String(_0x231881);
        _0x123f55.removeAttribute("title");
        if (!_0x123f55.querySelector(".rh-ai-app-preview-typebar")) {
          const _0x4ca952 = _0x4f28de(_0x10c05a(this.componentDrafts, _0x231881), {
            canRemove: this._canRemovePreviewParams()
          });
          if (_0x4ca952) {
            _0x123f55.insertAdjacentHTML("afterbegin", _0x4ca952);
          }
        }
        const _0x37d12f = _0x10c05a(this.componentDrafts, _0x231881);
        const _0xa8cacf = _0x123f55.querySelector(".ui-schema-field-label");
        const _0x2edbec = _0xa8cacf?.closest?.(".rh-vram-adv-label") || _0x123f55.querySelector(".rh-vram-adv-label");
        const _0x16301d = _0xa8cacf || _0x2edbec?.querySelector?.(".rh-adv-title, .ui-schema-field-label, span:not(.rh-tip):not(.ui-schema-info-tip)");
        if (_0x16301d) {
          _0x16301d.classList.add("rh-ai-app-preview-rename-target");
          _0x16301d.dataset.previewComponentIndex = String(_0x231881);
          _0x16301d.removeAttribute("title");
        }
        const _0x27c630 = _0x12a313(_0x37d12f || _0x8e2f13, "参数说明");
        const _0x2b3c9f = _0x2edbec || _0x123f55;
        let _0x1444a5 = Array.from(_0x2b3c9f.querySelectorAll?.(".rh-tip, .ui-schema-info-tip") || []);
        if (!_0x1444a5.length && _0x2b3c9f) {
          const _0x1accb2 = _0x174a64.createElement("span");
          _0x1accb2.className = "rh-tip ui-schema-info-tip";
          _0x1accb2.textContent = "!";
          if (_0x16301d) {
            _0x16301d.insertAdjacentElement("afterend", _0x1accb2);
          } else {
            _0x2b3c9f.appendChild(_0x1accb2);
          }
          _0x1444a5 = [_0x1accb2];
        }
        _0x1444a5.forEach(_0x572ee3 => {
          _0x572ee3.classList.add("rh-ai-app-preview-description-target", "rh-ai-app-preview-param-description-tip");
          _0x572ee3.dataset.previewComponentIndex = String(_0x231881);
          _0x572ee3.setAttribute("role", "button");
          _0x572ee3.setAttribute("tabindex", "0");
          _0x572ee3.setAttribute("aria-label", "编辑参数说明");
          _0x572ee3.setAttribute("data-tooltip", _0x27c630);
          _0x572ee3.setAttribute("title", _0x27c630);
        });
        const _0x4f071a = _0x123f55.querySelector(".rh-adv-control-line, .ui-schema-field-control");
        if (!_0x123f55.querySelector(".rh-ai-app-preview-drag-pad")) {
          const _0x317b64 = _0x174a64.createElement("span");
          _0x317b64.className = "rh-ai-app-preview-drag-pad";
          _0x317b64.dataset.previewComponentIndex = String(_0x231881);
          _0x317b64.setAttribute("aria-hidden", "true");
          _0x123f55.insertBefore(_0x317b64, _0x4f071a || null);
        }
      });
    }
    _getPreviewZoneElement(_0x36138d) {
      const _0x1f10b3 = String(_0x36138d || "").trim();
      if (!["input", "prompt", "params", "advanced"].includes(_0x1f10b3)) {
        return null;
      }
      return this.nodePreviewEl?.querySelector?.("[data-preview-zone=\"" + _0x1f10b3 + "\"]") || null;
    }
    clearUiSchemaBinding() {
      this.previewUiSchemaCleanup?.();
      this.previewUiSchemaCleanup = null;
    }
    destroy() {
      this.clearUiSchemaBinding();
    }
  }
  return new _0x2cb779();
}