export function createRhAiAppPreviewDragController({
  readState = () => ({}),
  actions = {},
  primitives = {},
  runtime = {}
} = {}) {
  const {
    PREVIEW_DROP_ZONES = Object.freeze(["input", "prompt", "params", "advanced"]),
    PREVIEW_CUSTOM_COMPONENT_LIMIT = 4,
    PREVIEW_DRAG_START_THRESHOLD_PX = 10,
    PREVIEW_RENAME_CLICK_TOLERANCE_PX = 3,
    PREVIEW_MOVE_ANIMATION_MS = 260,
    assignSequentialOrder: _0x22eb55,
    buildComponentByIndex: _0x41ae9d,
    canPreviewComponentBecomePrompt: _0x955262,
    canPreviewPromptBecomeParam: _0x1a544c,
    getComponentByIndex: _0x19fd84,
    getPreviewAdvancedParamComponents: _0x19ba60,
    getPreviewHomeParamComponents: _0x54db61,
    getPreviewInputComponents: _0x22abe4,
    getPreviewParamText: _0x123159,
    getPreviewPromptReturnControlType: _0x11d686,
    isParamComponent: _0x3e1ca6,
    moveComponentToOrder: _0x2dd84d,
    shouldReduceMotion: _0x1d2fd7
  } = primitives;
  const _0x15c195 = runtime.document || globalThis.document;
  const _0x2dd212 = runtime.window || globalThis.window;
  class _0x3d53e6 {
    constructor() {
      this.previewDrag = null;
      this.suppressPreviewRenameClick = false;
      this.suppressPreviewRenameClickTimer = 0;
    }
    get panel() {
      return readState()?.panel || null;
    }
    get nodePreviewEl() {
      return readState()?.nodePreviewEl || null;
    }
    get componentDrafts() {
      const _0x4534a1 = readState()?.componentDrafts;
      if (Array.isArray(_0x4534a1)) {
        return _0x4534a1;
      } else {
        return [];
      }
    }
    handlePointerDown(_0x5409b1) {
      return this._handlePreviewPointerDown(_0x5409b1);
    }
    handlePointerMove(_0x5bc7e1) {
      return this._handlePreviewPointerMove(_0x5bc7e1);
    }
    handlePointerEnd(_0x34ed9b) {
      return this._handlePreviewPointerEnd(_0x34ed9b);
    }
    consumeSuppressedRenameClickForTarget(_0x2fcd2f) {
      if (this.suppressPreviewRenameClick && _0x2fcd2f.target?.closest?.(".rh-ai-app-preview-draggable")) {
        this._consumeSuppressedPreviewRenameClick(_0x2fcd2f);
        return true;
      }
      return false;
    }
    captureComponentRect(_0x33a57c) {
      return this._capturePreviewComponentRect(_0x33a57c);
    }
    animateComponentFromRect(_0x303b51, _0x3af1fa) {
      return this._animatePreviewComponentFromRect(_0x303b51, _0x3af1fa);
    }
    placeParamDraft(_0x12dce6, _0x5523d3, _0x9d7aac = {}) {
      return this._placePreviewParamDraft(_0x12dce6, _0x5523d3, _0x9d7aac);
    }
    destroy() {
      const _0x382ad9 = this.previewDrag;
      if (_0x382ad9?.didLiveOrder && _0x382ad9.layoutSnapshot) {
        this._restorePreviewLayoutSnapshot(_0x382ad9.layoutSnapshot);
      }
      this._clearPreviewDragState();
      _0x2dd212?.clearTimeout?.(this.suppressPreviewRenameClickTimer);
      this.suppressPreviewRenameClick = false;
      this.suppressPreviewRenameClickTimer = 0;
    }
    _isPreviewControlTarget(_0x15fbfa) {
      return actions.isPreviewControlTarget?.(_0x15fbfa) === true;
    }
    _startPreviewInlineRename(_0x3380e6, _0x2b5dab) {
      return actions.startPreviewInlineRename?.(_0x3380e6, _0x2b5dab);
    }
    _refreshBundleFromComponents(_0x264614) {
      return actions.refreshBundleFromComponents?.(_0x264614) || null;
    }
    _patchPreviewWithoutRebuild(_0x1c3047, _0x4882e3) {
      return actions.patchPreviewWithoutRebuild?.(_0x1c3047, _0x4882e3);
    }
    _getPreviewZoneElement(_0x47ffef) {
      return actions.getPreviewZoneElement?.(_0x47ffef) || null;
    }
    _getPreviewDropZone(_0x459677, _0xb9b45f) {
      for (const _0x4dd87f of PREVIEW_DROP_ZONES) {
        const _0x57f1c7 = this._getPreviewZoneElement(_0x4dd87f);
        if (!_0x57f1c7) {
          continue;
        }
        const _0x3b2fb7 = _0x57f1c7.getBoundingClientRect();
        if (_0x459677 >= _0x3b2fb7.left && _0x459677 <= _0x3b2fb7.right && _0xb9b45f >= _0x3b2fb7.top && _0xb9b45f <= _0x3b2fb7.bottom) {
          return _0x4dd87f;
        }
      }
      return "";
    }
    _getPreviewMotionTarget(_0x221dea) {
      const _0x4cc7f7 = Number(_0x221dea);
      if (!Number.isInteger(_0x4cc7f7)) {
        return null;
      }
      const _0x5aebc6 = [".rh-ai-app-preview-prompt-target", ".rh-ai-app-preview-param-chip", ".rh-ai-app-preview-advanced-param", ".rh-ai-app-preview-input-slot"].map(_0x4f594e => _0x4f594e + "[data-preview-component-index=\"" + _0x4cc7f7 + "\"]").join(", ");
      return this.nodePreviewEl?.querySelector?.(_0x5aebc6) || null;
    }
    _snapshotPreviewRect(_0x4c6246) {
      const _0x28132a = _0x4c6246?.getBoundingClientRect?.();
      if (!_0x28132a) {
        return null;
      }
      return {
        left: _0x28132a.left,
        top: _0x28132a.top,
        width: _0x28132a.width,
        height: _0x28132a.height
      };
    }
    _capturePreviewComponentRect(_0x5982c6) {
      return this._snapshotPreviewRect(this._getPreviewMotionTarget(_0x5982c6));
    }
    _animatePreviewComponentFromRect(_0x378266, _0x3ede01) {
      if (_0x1d2fd7() || !_0x3ede01) {
        return false;
      }
      const _0x3c6edf = this._getPreviewMotionTarget(_0x378266);
      if (!_0x3c6edf?.animate) {
        return false;
      }
      const _0x4cc677 = _0x3c6edf.getBoundingClientRect?.();
      if (!_0x4cc677) {
        return false;
      }
      const _0x5cacf5 = Math.round(Number(_0x3ede01.left) - _0x4cc677.left);
      const _0x3f151d = Math.round(Number(_0x3ede01.top) - _0x4cc677.top);
      if (Math.abs(_0x5cacf5) < 1 && Math.abs(_0x3f151d) < 1) {
        return false;
      }
      _0x3c6edf.animate([{
        transform: "translate(" + _0x5cacf5 + "px, " + _0x3f151d + "px)",
        opacity: 0.72
      }, {
        transform: "translate(0, 0)",
        opacity: 1
      }], {
        duration: PREVIEW_MOVE_ANIMATION_MS,
        easing: "cubic-bezier(0.2, 0, 0.2, 1)"
      });
      return true;
    }
    _setPreviewDragTransform(_0x3b77ee, _0xa26c93, _0x26fc39) {
      if (!_0x3b77ee?.target) {
        return;
      }
      _0x3b77ee.currentClientX = _0xa26c93;
      _0x3b77ee.currentClientY = _0x26fc39;
      if (_0x3b77ee.ghost?.element) {
        _0x3b77ee.ghost.element.style.setProperty("--rh-ghost-x", Math.round(_0xa26c93 - _0x3b77ee.ghost.offsetX) + "px");
        _0x3b77ee.ghost.element.style.setProperty("--rh-ghost-y", Math.round(_0x26fc39 - _0x3b77ee.ghost.offsetY) + "px");
        return;
      }
      const _0x2e0af7 = Math.round(_0xa26c93 - _0x3b77ee.startClientX);
      const _0x504cf8 = Math.round(_0x26fc39 - _0x3b77ee.startClientY);
      _0x3b77ee.target.style.setProperty("--rh-drag-x", _0x2e0af7 + "px");
      _0x3b77ee.target.style.setProperty("--rh-drag-y", _0x504cf8 + "px");
    }
    _clearPreviewDragState() {
      const _0x3db41c = this.previewDrag;
      if (!_0x3db41c) {
        return;
      }
      try {
        _0x3db41c.target?.releasePointerCapture?.(_0x3db41c.pointerId);
      } catch {}
      _0x3db41c.target?.classList?.remove("is-dragging");
      _0x3db41c.target?.classList?.remove("is-drag-placeholder");
      _0x3db41c.target?.style?.removeProperty("--rh-drag-x");
      _0x3db41c.target?.style?.removeProperty("--rh-drag-y");
      this._clearPreviewHomeParamDropPlaceholder(_0x3db41c);
      this._clearPreviewAdvancedParamDropPlaceholder(_0x3db41c);
      _0x3db41c.ghost?.element?.remove?.();
      this.panel?.classList.remove("is-preview-dragging");
      this.nodePreviewEl?.querySelectorAll("[data-preview-zone]").forEach(_0x1e0c7d => _0x1e0c7d.classList.remove("is-drop-target", "is-param-drop-target", "is-prompt-drop-target"));
      this.previewDrag = null;
    }
    _suppressNextPreviewRenameClick() {
      _0x2dd212.clearTimeout(this.suppressPreviewRenameClickTimer);
      this.suppressPreviewRenameClick = true;
      this.suppressPreviewRenameClickTimer = _0x2dd212.setTimeout(() => {
        this.suppressPreviewRenameClick = false;
        this.suppressPreviewRenameClickTimer = 0;
      }, 160);
    }
    _consumeSuppressedPreviewRenameClick(_0xad148c) {
      if (!this.suppressPreviewRenameClick) {
        return false;
      }
      this.suppressPreviewRenameClick = false;
      _0x2dd212.clearTimeout(this.suppressPreviewRenameClickTimer);
      this.suppressPreviewRenameClickTimer = 0;
      _0xad148c?.preventDefault?.();
      _0xad148c?.stopPropagation?.();
      return true;
    }
    _updatePreviewDropTarget(_0x3bd5bc, _0x118df4) {
      const _0x1226be = this._getPreviewDropZone(_0x3bd5bc, _0x118df4);
      this.nodePreviewEl?.querySelectorAll("[data-preview-zone]").forEach(_0x14ce93 => {
        const _0x1c3901 = _0x1226be && _0x14ce93.dataset.previewZone === _0x1226be;
        _0x14ce93.classList.toggle("is-drop-target", !!_0x1c3901);
      });
      return _0x1226be;
    }
    _activatePreviewDrag(_0x52a528, _0x158f2a) {
      if (!_0x52a528?.target || _0x52a528.isActive) {
        return false;
      }
      const _0xadb89f = this._createPreviewDragGhost(_0x52a528.target, _0x158f2a);
      _0x52a528.ghost = _0xadb89f;
      _0x52a528.isActive = true;
      _0x52a528.moved = true;
      _0x52a528.layoutSnapshot = this._capturePreviewLayoutSnapshot();
      _0x52a528.target.classList.add("is-dragging");
      if (_0xadb89f) {
        _0x52a528.target.classList.add("is-drag-placeholder");
      }
      this.panel?.classList.add("is-preview-dragging");
      this._setPreviewDragTransform(_0x52a528, _0x158f2a.clientX, _0x158f2a.clientY);
      return true;
    }
    _capturePreviewLayoutSnapshot() {
      return this.componentDrafts.map(_0x57405d => ({
        index: Number(_0x57405d?.index),
        inputOrder: _0x57405d?.inputOrder,
        homeParamOrder: _0x57405d?.homeParamOrder,
        advancedParamOrder: _0x57405d?.advancedParamOrder,
        previewPlacement: _0x57405d?.previewPlacement,
        hasInputOrder: Object.hasOwn(_0x57405d || {}, "inputOrder"),
        hasHomeParamOrder: Object.hasOwn(_0x57405d || {}, "homeParamOrder"),
        hasAdvancedParamOrder: Object.hasOwn(_0x57405d || {}, "advancedParamOrder"),
        hasPreviewPlacement: Object.hasOwn(_0x57405d || {}, "previewPlacement")
      }));
    }
    _restorePreviewLayoutSnapshot(_0x4d9b83 = []) {
      const _0x1c26b0 = _0x41ae9d(this.componentDrafts);
      _0x4d9b83.forEach(_0x17f11 => {
        const _0xc5ab64 = _0x1c26b0.get(Number(_0x17f11?.index));
        if (!_0xc5ab64) {
          return;
        }
        if (_0x17f11.hasInputOrder) {
          _0xc5ab64.inputOrder = _0x17f11.inputOrder;
        } else {
          delete _0xc5ab64.inputOrder;
        }
        if (_0x17f11.hasHomeParamOrder) {
          _0xc5ab64.homeParamOrder = _0x17f11.homeParamOrder;
        } else {
          delete _0xc5ab64.homeParamOrder;
        }
        if (_0x17f11.hasAdvancedParamOrder) {
          _0xc5ab64.advancedParamOrder = _0x17f11.advancedParamOrder;
        } else {
          delete _0xc5ab64.advancedParamOrder;
        }
        if (_0x17f11.hasPreviewPlacement) {
          _0xc5ab64.previewPlacement = _0x17f11.previewPlacement;
        } else {
          delete _0xc5ab64.previewPlacement;
        }
      });
    }
    _getPreviewDropOrder(_0x564a3f, _0x2ad64b, _0x1edfe0, _0x18e53f = null) {
      const _0x5f07f = this._getPreviewZoneElement(_0x564a3f);
      if (!_0x5f07f) {
        return 0;
      }
      const _0x56b9fe = Array.from(_0x5f07f.querySelectorAll(_0x1edfe0)).filter(_0x3865eb => !_0x3865eb.classList.contains("is-dragging"));
      const _0x17c4ea = _0x564a3f === "advanced" && Number.isFinite(Number(_0x18e53f));
      let _0x2d5d72 = 0;
      _0x56b9fe.forEach(_0x16a8aa => {
        const _0x4c0b16 = _0x16a8aa.getBoundingClientRect();
        if (_0x17c4ea) {
          if (_0x18e53f > _0x4c0b16.top + _0x4c0b16.height / 2) {
            _0x2d5d72 += 1;
          }
          return;
        }
        if (_0x2ad64b > _0x4c0b16.left + _0x4c0b16.width / 2) {
          _0x2d5d72 += 1;
        }
      });
      return _0x2d5d72;
    }
    _getPreviewOrderedIndexesDuringDrag(_0x282c30, _0x15f85c, _0x2d5262) {
      const _0x2045aa = Number(_0x282c30?.index);
      if (!Number.isInteger(_0x2045aa)) {
        return [];
      }
      const _0x49c93a = _0x15f85c === "input" ? _0x22abe4(this.componentDrafts) : _0x15f85c === "params" ? _0x54db61(this.componentDrafts) : _0x15f85c === "advanced" ? _0x19ba60(this.componentDrafts) : [];
      const _0x4abeec = _0x49c93a.map(_0x5389c5 => Number(_0x5389c5.index));
      const _0x526204 = _0x4abeec.includes(_0x2045aa);
      if (_0x15f85c === "input" && !_0x526204) {
        return _0x4abeec;
      }
      if ((_0x15f85c === "params" || _0x15f85c === "advanced") && !_0x526204) {
        const _0x3711c7 = _0x19fd84(this.componentDrafts, _0x2045aa);
        if (!_0x3711c7 || !_0x3e1ca6(_0x3711c7)) {
          return _0x4abeec;
        }
        if (_0x15f85c === "params" && _0x4abeec.length >= PREVIEW_CUSTOM_COMPONENT_LIMIT) {
          return _0x4abeec;
        }
      }
      const _0x3346ea = _0x4abeec.filter(_0x2c72c1 => _0x2c72c1 !== _0x2045aa);
      const _0x9da287 = Math.max(0, Math.min(_0x3346ea.length, Number(_0x2d5262) || 0));
      _0x3346ea.splice(_0x9da287, 0, _0x2045aa);
      if (_0x15f85c === "params") {
        return _0x3346ea.slice(0, PREVIEW_CUSTOM_COMPONENT_LIMIT);
      } else {
        return _0x3346ea;
      }
    }
    _animatePreviewZoneOrder(_0x243df0, _0x3d9deb, _0x165f5b = []) {
      const _0x228c93 = this._getPreviewZoneElement(_0x243df0);
      if (!_0x228c93) {
        return false;
      }
      const _0x5a503a = Array.from(_0x228c93.querySelectorAll(_0x3d9deb));
      const _0x59a190 = new Map(_0x5a503a.map(_0x48b38a => [Number(_0x48b38a.dataset.previewComponentIndex), _0x48b38a]));
      const _0x26fab5 = new Map(_0x5a503a.map(_0x30a905 => [_0x30a905, _0x30a905.getBoundingClientRect()]));
      _0x165f5b.forEach(_0xe0587d => {
        const _0x22bcdd = _0x59a190.get(Number(_0xe0587d));
        if (_0x22bcdd) {
          _0x228c93.appendChild(_0x22bcdd);
        }
      });
      _0x5a503a.forEach(_0x32e0ef => {
        if (_0x32e0ef.classList.contains("is-dragging")) {
          return;
        }
        const _0x16380c = _0x26fab5.get(_0x32e0ef);
        const _0xc6bb77 = _0x32e0ef.getBoundingClientRect();
        if (!_0x16380c || !_0xc6bb77) {
          return;
        }
        const _0x2e8608 = _0x16380c.left - _0xc6bb77.left;
        const _0x14ff78 = _0x16380c.top - _0xc6bb77.top;
        if (Math.abs(_0x2e8608) < 1 && Math.abs(_0x14ff78) < 1) {
          return;
        }
        _0x32e0ef.animate?.([{
          transform: "translate(" + _0x2e8608 + "px, " + _0x14ff78 + "px)"
        }, {
          transform: "translate(0, 0)"
        }], {
          duration: 210,
          easing: "cubic-bezier(0.2, 0, 0.2, 1)"
        });
      });
      return true;
    }
    _createPreviewDragGhost(_0x5a200e, _0x36d376) {
      const _0xcf7d04 = _0x5a200e?.getBoundingClientRect?.();
      if (!_0xcf7d04) {
        return null;
      }
      const _0x1b0416 = _0x5a200e.classList?.contains("rh-ai-app-preview-prompt-draggable");
      const _0x3e457f = _0x1b0416 ? _0x15c195.createElement("div") : _0x5a200e.cloneNode(true);
      if (_0x1b0416) {
        const _0x5f350b = Number(_0x5a200e.dataset.previewComponentIndex);
        const _0x1d8cfa = _0x19fd84(this.componentDrafts, _0x5f350b);
        _0x3e457f.textContent = String(_0x1d8cfa?.label || _0x1d8cfa?.fieldName || "提示词").trim() || "提示词";
        _0x3e457f.className = "rh-ai-app-preview-drag-ghost rh-ai-app-preview-prompt-ghost";
      } else {
        _0x3e457f.classList.add("rh-ai-app-preview-drag-ghost");
        _0x3e457f.classList.remove("is-dragging", "is-drag-placeholder");
        _0x3e457f.removeAttribute("data-preview-component-index");
        _0x3e457f.querySelectorAll?.(".rh-ai-app-preview-typebar").forEach(_0x4e74fb => {
          _0x4e74fb.remove();
        });
        _0x3e457f.querySelectorAll?.("[data-preview-component-index]").forEach(_0x22b7ee => {
          _0x22b7ee.removeAttribute("data-preview-component-index");
        });
      }
      const _0x5e9d3f = _0x1b0416 ? Math.min(Math.max(120, Math.round(_0xcf7d04.width * 0.46)), 260) : Math.round(_0xcf7d04.width);
      const _0x1dd84b = _0x1b0416 ? 40 : Math.round(_0xcf7d04.height);
      const _0x53c870 = _0x1b0416 ? Math.max(18, Math.min(_0x5e9d3f - 18, _0x36d376.clientX - _0xcf7d04.left)) : _0x36d376.clientX - _0xcf7d04.left;
      const _0x33cb81 = _0x1b0416 ? Math.max(12, Math.min(_0x1dd84b - 12, _0x36d376.clientY - _0xcf7d04.top)) : _0x36d376.clientY - _0xcf7d04.top;
      _0x3e457f.style.setProperty("--rh-ghost-width", _0x5e9d3f + "px");
      _0x3e457f.style.setProperty("--rh-ghost-height", _0x1dd84b + "px");
      _0x15c195.body.appendChild(_0x3e457f);
      return {
        element: _0x3e457f,
        offsetX: _0x53c870,
        offsetY: _0x33cb81
      };
    }
    _createPreviewHomeParamDropPlaceholder(_0x136c8f) {
      if (!_0x136c8f || _0x136c8f.homePlaceholder?.isConnected) {
        return _0x136c8f?.homePlaceholder || null;
      }
      const _0x4f9338 = this._getPreviewZoneElement("params");
      const _0x5eac97 = _0x19fd84(this.componentDrafts, _0x136c8f.index);
      if (!_0x4f9338 || !_0x5eac97 || !_0x3e1ca6(_0x5eac97)) {
        return null;
      }
      const _0x118b36 = _0x15c195.createElement("div");
      _0x118b36.className = "img-pill-btn ui-schema-menu-trigger rh-ai-app-preview-component rh-ai-app-preview-draggable rh-ai-app-preview-param-chip rh-ai-app-preview-drop-placeholder is-dragging is-drag-placeholder";
      _0x118b36.dataset.previewDragKind = "param";
      _0x118b36.dataset.previewComponentIndex = String(_0x136c8f.index);
      _0x118b36.setAttribute("aria-hidden", "true");
      const _0x2a55ec = _0x15c195.createElement("span");
      _0x2a55ec.className = "rh-ai-app-preview-param-label";
      _0x2a55ec.textContent = _0x123159(_0x5eac97);
      _0x118b36.appendChild(_0x2a55ec);
      const _0x12a615 = _0x15c195.createElement("span");
      _0x12a615.className = "rh-ai-app-preview-drag-pad";
      _0x12a615.setAttribute("aria-hidden", "true");
      _0x118b36.appendChild(_0x12a615);
      _0x4f9338.appendChild(_0x118b36);
      _0x136c8f.homePlaceholder = _0x118b36;
      return _0x118b36;
    }
    _clearPreviewHomeParamDropPlaceholder(_0x39c512, {
      animate = false
    } = {}) {
      const _0x2508b3 = _0x39c512?.homePlaceholder;
      if (!_0x2508b3) {
        return;
      }
      if (!_0x2508b3.isConnected) {
        _0x39c512.homePlaceholder = null;
        return;
      }
      const _0xb71076 = _0x2508b3.closest?.("[data-preview-zone]");
      const _0x2d565e = animate && _0xb71076 ? Array.from(_0xb71076.querySelectorAll(".rh-ai-app-preview-param-chip")).filter(_0x348cef => _0x348cef !== _0x2508b3) : [];
      const _0x263871 = new Map(_0x2d565e.map(_0x4c7989 => [_0x4c7989, _0x4c7989.getBoundingClientRect()]));
      _0x2508b3.remove();
      _0x2d565e.forEach(_0x1a5517 => {
        const _0x2e4426 = _0x263871.get(_0x1a5517);
        const _0x1af7b3 = _0x1a5517.getBoundingClientRect();
        if (!_0x2e4426 || !_0x1af7b3) {
          return;
        }
        const _0x1aab27 = _0x2e4426.left - _0x1af7b3.left;
        const _0x82a90 = _0x2e4426.top - _0x1af7b3.top;
        if (Math.abs(_0x1aab27) < 1 && Math.abs(_0x82a90) < 1) {
          return;
        }
        _0x1a5517.animate?.([{
          transform: "translate(" + _0x1aab27 + "px, " + _0x82a90 + "px)"
        }, {
          transform: "translate(0, 0)"
        }], {
          duration: 210,
          easing: "cubic-bezier(0.2, 0, 0.2, 1)"
        });
      });
      _0x39c512.homePlaceholder = null;
    }
    _createPreviewAdvancedParamDropPlaceholder(_0x42a2cc) {
      if (!_0x42a2cc || _0x42a2cc.advancedPlaceholder?.isConnected) {
        return _0x42a2cc?.advancedPlaceholder || null;
      }
      const _0xf0afad = this._getPreviewZoneElement("advanced");
      const _0x299167 = _0x19fd84(this.componentDrafts, _0x42a2cc.index);
      if (!_0xf0afad || !_0x299167 || !_0x3e1ca6(_0x299167)) {
        return null;
      }
      const _0x5e155b = _0x15c195.createElement("div");
      _0x5e155b.className = "ui-schema-field rh-vram-adv-row rh-ai-app-preview-draggable rh-ai-app-preview-advanced-param rh-ai-app-preview-drop-placeholder is-dragging is-drag-placeholder";
      _0x5e155b.dataset.previewDragKind = "advanced-param";
      _0x5e155b.dataset.previewComponentIndex = String(_0x42a2cc.index);
      _0x5e155b.setAttribute("aria-hidden", "true");
      const _0x2ef01b = _0x15c195.createElement("div");
      _0x2ef01b.className = "rh-vram-adv-label";
      const _0x3f10a0 = _0x15c195.createElement("span");
      _0x3f10a0.className = "rh-adv-title ui-schema-field-label";
      _0x3f10a0.textContent = _0x123159(_0x299167);
      _0x2ef01b.appendChild(_0x3f10a0);
      _0x5e155b.appendChild(_0x2ef01b);
      const _0x535d1b = _0x15c195.createElement("span");
      _0x535d1b.className = "rh-ai-app-preview-drag-pad";
      _0x535d1b.setAttribute("aria-hidden", "true");
      _0x5e155b.appendChild(_0x535d1b);
      const _0x328e66 = _0x15c195.createElement("div");
      _0x328e66.className = "ui-schema-field-control rh-ai-app-preview-placeholder-control";
      _0x5e155b.appendChild(_0x328e66);
      _0xf0afad.appendChild(_0x5e155b);
      _0x42a2cc.advancedPlaceholder = _0x5e155b;
      return _0x5e155b;
    }
    _clearPreviewAdvancedParamDropPlaceholder(_0x3f2bc6, {
      animate = false
    } = {}) {
      const _0x2bf0e7 = _0x3f2bc6?.advancedPlaceholder;
      if (!_0x2bf0e7) {
        return;
      }
      if (!_0x2bf0e7.isConnected) {
        _0x3f2bc6.advancedPlaceholder = null;
        return;
      }
      const _0x12b3f0 = _0x2bf0e7.closest?.("[data-preview-zone]");
      const _0x3e4d31 = animate && _0x12b3f0 ? Array.from(_0x12b3f0.querySelectorAll(".rh-ai-app-preview-advanced-param")).filter(_0x3ccab5 => _0x3ccab5 !== _0x2bf0e7) : [];
      const _0x526eaf = new Map(_0x3e4d31.map(_0x3ff0e4 => [_0x3ff0e4, _0x3ff0e4.getBoundingClientRect()]));
      _0x2bf0e7.remove();
      _0x3e4d31.forEach(_0x246c5f => {
        const _0x5545c4 = _0x526eaf.get(_0x246c5f);
        const _0x52ab04 = _0x246c5f.getBoundingClientRect();
        if (!_0x5545c4 || !_0x52ab04) {
          return;
        }
        const _0x2c9f87 = _0x5545c4.left - _0x52ab04.left;
        const _0x227e17 = _0x5545c4.top - _0x52ab04.top;
        if (Math.abs(_0x2c9f87) < 1 && Math.abs(_0x227e17) < 1) {
          return;
        }
        _0x246c5f.animate?.([{
          transform: "translate(" + _0x2c9f87 + "px, " + _0x227e17 + "px)"
        }, {
          transform: "translate(0, 0)"
        }], {
          duration: 210,
          easing: "cubic-bezier(0.2, 0, 0.2, 1)"
        });
      });
      _0x3f2bc6.advancedPlaceholder = null;
    }
    _reorderPreviewInputsDuringDrag(_0x28243d) {
      if (!_0x28243d || _0x28243d.dragKind !== "input") {
        return;
      }
      const _0x111c44 = _0x22abe4(this.componentDrafts);
      if (_0x111c44.length <= 1) {
        return;
      }
      const _0x4d0d9e = this._getPreviewDropOrder("input", _0x28243d.currentClientX, ".rh-ai-app-preview-input-slot");
      _0x2dd84d(_0x111c44, _0x28243d.index, "inputOrder", _0x4d0d9e);
      const _0x4cea64 = _0x22abe4(this.componentDrafts).map(_0x524e11 => Number(_0x524e11.index));
      const _0x4e5646 = "input:" + _0x4cea64.join(",");
      if (_0x28243d.lastPreviewOrderKey === _0x4e5646) {
        return;
      }
      this._animatePreviewZoneOrder("input", ".rh-ai-app-preview-input-slot", _0x4cea64);
      _0x28243d.lastPreviewOrderKey = _0x4e5646;
      _0x28243d.didLiveOrder = true;
    }
    _placePreviewParamDraft(_0x540418, _0x58cdfa, {
      clientX = null,
      clientY = null
    } = {}) {
      if (!_0x540418 || !_0x3e1ca6(_0x540418)) {
        return false;
      }
      const _0x2891e0 = _0x58cdfa === "home" ? "home" : "advanced";
      if (_0x2891e0 === "home") {
        const _0x5e08ac = _0x540418.previewPlacement === "home";
        if (!_0x5e08ac && _0x54db61(this.componentDrafts).length >= PREVIEW_CUSTOM_COMPONENT_LIMIT) {
          return false;
        }
        _0x540418.previewPlacement = "home";
        delete _0x540418.advancedParamOrder;
        const _0xcd43a9 = _0x54db61(this.componentDrafts);
        const _0x43d98d = clientX !== null && Number.isFinite(Number(clientX)) ? this._getPreviewDropOrder("params", clientX, ".rh-ai-app-preview-param-chip") : _0xcd43a9.length;
        _0x2dd84d(_0xcd43a9, _0x540418.index, "homeParamOrder", _0x43d98d);
        return true;
      }
      _0x540418.previewPlacement = "advanced";
      delete _0x540418.homeParamOrder;
      _0x22eb55(_0x54db61(this.componentDrafts), "homeParamOrder");
      const _0x590ccf = _0x19ba60(this.componentDrafts);
      const _0x10d751 = clientX !== null && Number.isFinite(Number(clientX));
      const _0x2351bd = clientY !== null && Number.isFinite(Number(clientY));
      const _0x3d2014 = _0x10d751 || _0x2351bd ? this._getPreviewDropOrder("advanced", clientX, ".rh-ai-app-preview-advanced-param", clientY) : _0x590ccf.length;
      _0x2dd84d(_0x590ccf, _0x540418.index, "advancedParamOrder", _0x3d2014);
      return true;
    }
    _movePreviewTextParamToPrompt(_0x450d21) {
      const _0x306216 = _0x19fd84(this.componentDrafts, _0x450d21?.index);
      if (!_0x306216 || !_0x3e1ca6(_0x306216) || !_0x955262(_0x306216)) {
        return false;
      }
      _0x306216.componentKind = "prompt";
      _0x306216.controlType = "prompt";
      delete _0x306216.homeParamOrder;
      delete _0x306216.advancedParamOrder;
      delete _0x306216.previewPlacement;
      _0x22eb55(_0x54db61(this.componentDrafts), "homeParamOrder");
      return true;
    }
    _movePreviewPromptToParam(_0xc1b166, _0x13382b, _0x1b7633 = "") {
      const _0x51e808 = _0x19fd84(this.componentDrafts, _0xc1b166?.index);
      if (!_0x51e808 || !_0x1a544c(_0x51e808)) {
        return false;
      }
      const _0x4262d4 = _0x11d686(_0x51e808, _0x1b7633);
      if (!_0x4262d4) {
        return false;
      }
      _0x51e808.componentKind = "param";
      _0x51e808.controlType = _0x4262d4;
      const _0x370bfc = this._placePreviewParamDraft(_0x51e808, _0x13382b, {
        clientX: _0xc1b166?.currentClientX,
        clientY: _0xc1b166?.currentClientY
      });
      if (!_0x370bfc) {
        _0x51e808.componentKind = "prompt";
        _0x51e808.controlType = "prompt";
        delete _0x51e808.homeParamOrder;
        delete _0x51e808.advancedParamOrder;
        delete _0x51e808.previewPlacement;
      }
      return _0x370bfc;
    }
    _movePreviewParamToHome(_0x533f60) {
      const _0x2f9cc4 = _0x19fd84(this.componentDrafts, _0x533f60.index);
      if (!_0x2f9cc4 || !_0x3e1ca6(_0x2f9cc4)) {
        return false;
      }
      const _0x94102f = _0x54db61(this.componentDrafts).map(_0x35d531 => Number(_0x35d531.index)).join(",");
      const _0x48f04a = _0x2f9cc4.previewPlacement === "home";
      if (!_0x48f04a && _0x54db61(this.componentDrafts).length >= PREVIEW_CUSTOM_COMPONENT_LIMIT) {
        return false;
      }
      _0x2f9cc4.previewPlacement = "home";
      delete _0x2f9cc4.advancedParamOrder;
      const _0x5755b6 = _0x54db61(this.componentDrafts);
      const _0x2250f6 = this._getPreviewDropOrder("params", _0x533f60.currentClientX, ".rh-ai-app-preview-param-chip");
      _0x2dd84d(_0x5755b6, _0x533f60.index, "homeParamOrder", _0x2250f6);
      const _0x40493e = _0x54db61(this.componentDrafts).map(_0x914534 => Number(_0x914534.index)).join(",");
      return _0x94102f !== _0x40493e;
    }
    _movePreviewParamToAdvanced(_0x216c79) {
      const _0x40ed61 = _0x19fd84(this.componentDrafts, _0x216c79.index);
      if (!_0x40ed61 || !_0x3e1ca6(_0x40ed61)) {
        return false;
      }
      const _0x3bd31f = _0x19ba60(this.componentDrafts).map(_0x1f61a2 => Number(_0x1f61a2.index)).join(",");
      const _0x2be42c = _0x40ed61.previewPlacement === "advanced";
      const _0x4a8f96 = Object.hasOwn(_0x40ed61, "homeParamOrder");
      _0x40ed61.previewPlacement = "advanced";
      delete _0x40ed61.homeParamOrder;
      _0x22eb55(_0x54db61(this.componentDrafts), "homeParamOrder");
      const _0x4bb236 = _0x19ba60(this.componentDrafts);
      const _0x451fca = this._getPreviewDropOrder("advanced", _0x216c79.currentClientX, ".rh-ai-app-preview-advanced-param", _0x216c79.currentClientY);
      _0x2dd84d(_0x4bb236, _0x216c79.index, "advancedParamOrder", _0x451fca);
      const _0x309330 = _0x19ba60(this.componentDrafts).map(_0xc38396 => Number(_0xc38396.index)).join(",");
      return !_0x2be42c || _0x4a8f96 || _0x3bd31f !== _0x309330;
    }
    _reorderPreviewHomeParamsDuringDrag(_0x2a8c42) {
      if (!_0x2a8c42 || _0x2a8c42.dragKind !== "param" && _0x2a8c42.dragKind !== "advanced-param") {
        return;
      }
      const _0x52cb17 = this._getPreviewDropOrder("params", _0x2a8c42.currentClientX, ".rh-ai-app-preview-param-chip");
      const _0x4340f2 = this._getPreviewOrderedIndexesDuringDrag(_0x2a8c42, "params", _0x52cb17);
      if (!_0x4340f2.includes(Number(_0x2a8c42.index))) {
        this._clearPreviewHomeParamDropPlaceholder(_0x2a8c42, {
          animate: true
        });
        return;
      }
      if (_0x2a8c42.dragKind === "advanced-param") {
        this._createPreviewHomeParamDropPlaceholder(_0x2a8c42);
      } else {
        const _0x2b02b5 = _0x54db61(this.componentDrafts);
        _0x2dd84d(_0x2b02b5, _0x2a8c42.index, "homeParamOrder", _0x52cb17);
      }
      const _0x5374b1 = _0x2a8c42.dragKind === "advanced-param" ? _0x4340f2 : _0x54db61(this.componentDrafts).map(_0x5c084e => Number(_0x5c084e.index));
      const _0x3c8401 = "params:" + _0x5374b1.join(",");
      if (_0x2a8c42.lastPreviewOrderKey === _0x3c8401) {
        return;
      }
      this._animatePreviewZoneOrder("params", ".rh-ai-app-preview-param-chip", _0x5374b1);
      _0x2a8c42.lastPreviewOrderKey = _0x3c8401;
      if (_0x2a8c42.dragKind === "param") {
        _0x2a8c42.didLiveOrder = true;
      }
    }
    _reorderPreviewAdvancedParamsDuringDrag(_0x1a6f0c) {
      if (!_0x1a6f0c || _0x1a6f0c.dragKind !== "param" && _0x1a6f0c.dragKind !== "advanced-param") {
        return;
      }
      const _0xd9b3f7 = this._getPreviewDropOrder("advanced", _0x1a6f0c.currentClientX, ".rh-ai-app-preview-advanced-param", _0x1a6f0c.currentClientY);
      const _0x19cf84 = this._getPreviewOrderedIndexesDuringDrag(_0x1a6f0c, "advanced", _0xd9b3f7);
      if (!_0x19cf84.includes(Number(_0x1a6f0c.index))) {
        this._clearPreviewAdvancedParamDropPlaceholder(_0x1a6f0c, {
          animate: true
        });
        return;
      }
      if (_0x1a6f0c.dragKind === "param") {
        this._createPreviewAdvancedParamDropPlaceholder(_0x1a6f0c);
      } else {
        const _0x2dbafa = _0x19ba60(this.componentDrafts);
        _0x2dd84d(_0x2dbafa, _0x1a6f0c.index, "advancedParamOrder", _0xd9b3f7);
      }
      const _0x22b5c7 = _0x1a6f0c.dragKind === "param" ? _0x19cf84 : _0x19ba60(this.componentDrafts).map(_0x5a684f => Number(_0x5a684f.index));
      const _0x36932e = "advanced:" + _0x22b5c7.join(",");
      if (_0x1a6f0c.lastPreviewOrderKey === _0x36932e) {
        return;
      }
      this._animatePreviewZoneOrder("advanced", ".rh-ai-app-preview-advanced-param", _0x22b5c7);
      _0x1a6f0c.lastPreviewOrderKey = _0x36932e;
      if (_0x1a6f0c.dragKind === "advanced-param") {
        _0x1a6f0c.didLiveOrder = true;
      }
    }
    _handlePreviewPointerDown(_0x4a01ea) {
      if (_0x4a01ea.button !== 0) {
        return;
      }
      if (this._isPreviewControlTarget(_0x4a01ea.target)) {
        return;
      }
      const _0x10dad1 = _0x4a01ea.target?.closest?.(".rh-ai-app-preview-draggable");
      if (!_0x10dad1 || !this.panel?.contains(_0x10dad1)) {
        return;
      }
      const _0x1f029c = Number(_0x10dad1.dataset.previewComponentIndex);
      if (!Number.isInteger(_0x1f029c)) {
        return;
      }
      const _0x4de6b3 = String(_0x10dad1.dataset.previewDragKind || "param");
      const _0x50d919 = _0x4a01ea.target?.closest?.(".rh-ai-app-preview-rename-target") || null;
      const _0x3a167b = _0x50d919 && _0x10dad1.contains(_0x50d919) ? _0x50d919 : null;
      this.previewDrag = {
        index: _0x1f029c,
        target: _0x10dad1,
        renameTarget: _0x3a167b,
        ghost: null,
        pointerId: _0x4a01ea.pointerId,
        dragKind: _0x4de6b3,
        startClientX: _0x4a01ea.clientX,
        startClientY: _0x4a01ea.clientY,
        currentClientX: _0x4a01ea.clientX,
        currentClientY: _0x4a01ea.clientY,
        moved: false,
        isActive: false,
        lastPreviewOrderKey: "",
        didLiveOrder: false,
        homePlaceholder: null,
        advancedPlaceholder: null,
        layoutSnapshot: null
      };
      _0x10dad1.setPointerCapture?.(_0x4a01ea.pointerId);
    }
    _handlePreviewPointerMove(_0x24da83) {
      const _0x5cd0d0 = this.previewDrag;
      if (!_0x5cd0d0) {
        return;
      }
      const _0x3966f6 = Math.abs(_0x24da83.clientX - _0x5cd0d0.startClientX) >= PREVIEW_DRAG_START_THRESHOLD_PX || Math.abs(_0x24da83.clientY - _0x5cd0d0.startClientY) >= PREVIEW_DRAG_START_THRESHOLD_PX;
      if (!_0x5cd0d0.isActive && !_0x3966f6) {
        _0x5cd0d0.currentClientX = _0x24da83.clientX;
        _0x5cd0d0.currentClientY = _0x24da83.clientY;
        return;
      }
      if (!_0x5cd0d0.isActive && !this._activatePreviewDrag(_0x5cd0d0, _0x24da83)) {
        return;
      }
      _0x5cd0d0.moved = true;
      this._setPreviewDragTransform(_0x5cd0d0, _0x24da83.clientX, _0x24da83.clientY);
      const _0x2a4818 = this._updatePreviewDropTarget(_0x24da83.clientX, _0x24da83.clientY);
      const _0x540360 = _0x19fd84(this.componentDrafts, _0x5cd0d0.index);
      const _0x559211 = (_0x5cd0d0.dragKind === "param" || _0x5cd0d0.dragKind === "advanced-param") && _0x955262(_0x540360);
      const _0x5d88d9 = _0x5cd0d0.dragKind === "prompt" && _0x1a544c(_0x540360);
      if (_0x2a4818 === "params" && _0x5cd0d0.moved && (_0x5cd0d0.dragKind === "param" || _0x5cd0d0.dragKind === "advanced-param" || _0x5d88d9)) {
        this._getPreviewZoneElement("params")?.classList.add("is-param-drop-target");
      } else {
        this._getPreviewZoneElement("params")?.classList.remove("is-param-drop-target");
      }
      this._getPreviewZoneElement("prompt")?.classList.toggle("is-prompt-drop-target", _0x2a4818 === "prompt" && _0x559211);
      if (_0x5cd0d0.moved && _0x5cd0d0.dragKind === "input" && _0x2a4818 === "input") {
        this._reorderPreviewInputsDuringDrag(_0x5cd0d0);
      }
      if (_0x5cd0d0.moved && (_0x5cd0d0.dragKind === "param" || _0x5cd0d0.dragKind === "advanced-param")) {
        if (_0x2a4818 === "params") {
          if (_0x5cd0d0.advancedPlaceholder) {
            this._clearPreviewAdvancedParamDropPlaceholder(_0x5cd0d0, {
              animate: true
            });
          }
          this._reorderPreviewHomeParamsDuringDrag(_0x5cd0d0);
        } else if (_0x2a4818 === "advanced") {
          if (_0x5cd0d0.homePlaceholder) {
            this._clearPreviewHomeParamDropPlaceholder(_0x5cd0d0, {
              animate: true
            });
          }
          this._reorderPreviewAdvancedParamsDuringDrag(_0x5cd0d0);
        } else if (_0x5cd0d0.homePlaceholder) {
          this._clearPreviewHomeParamDropPlaceholder(_0x5cd0d0, {
            animate: true
          });
          _0x5cd0d0.lastPreviewOrderKey = "";
        } else if (_0x5cd0d0.advancedPlaceholder) {
          this._clearPreviewAdvancedParamDropPlaceholder(_0x5cd0d0, {
            animate: true
          });
          _0x5cd0d0.lastPreviewOrderKey = "";
        }
      }
      _0x24da83.preventDefault();
    }
    _handlePreviewPointerEnd(_0x1c5e23) {
      const _0x286b15 = this.previewDrag;
      if (!_0x286b15) {
        return;
      }
      if (!_0x286b15.isActive) {
        const _0x8909b5 = _0x286b15.renameTarget;
        const _0x1306f1 = Number(_0x8909b5?.dataset?.previewComponentIndex);
        const _0x341ad8 = Math.abs(_0x1c5e23.clientX - _0x286b15.startClientX) > PREVIEW_RENAME_CLICK_TOLERANCE_PX || Math.abs(_0x1c5e23.clientY - _0x286b15.startClientY) > PREVIEW_RENAME_CLICK_TOLERANCE_PX;
        const _0x1b9b02 = _0x1c5e23.type === "pointerup" && _0x8909b5 && this.panel?.contains(_0x8909b5) && Number.isInteger(_0x1306f1) && !_0x341ad8;
        this._clearPreviewDragState();
        if (_0x341ad8) {
          this._suppressNextPreviewRenameClick();
          _0x1c5e23.preventDefault();
          _0x1c5e23.stopPropagation();
          return;
        }
        if (_0x1b9b02) {
          this._suppressNextPreviewRenameClick();
          _0x1c5e23.preventDefault();
          _0x1c5e23.stopPropagation();
          this._startPreviewInlineRename(_0x8909b5, _0x1306f1);
        }
        return;
      }
      this._suppressNextPreviewRenameClick();
      this._setPreviewDragTransform(_0x286b15, _0x1c5e23.clientX, _0x1c5e23.clientY);
      const _0x143739 = this._getPreviewDropZone(_0x286b15.currentClientX, _0x286b15.currentClientY);
      const _0x1e74d1 = this._snapshotPreviewRect(_0x286b15.ghost?.element || _0x286b15.target);
      const _0x15d91a = _0x19fd84(this.componentDrafts, _0x286b15.index);
      const _0x2a51f7 = (_0x286b15.dragKind === "param" || _0x286b15.dragKind === "advanced-param") && _0x955262(_0x15d91a);
      const _0x4138af = _0x286b15.dragKind === "prompt" && _0x1a544c(_0x15d91a);
      const _0xbec849 = _0x4138af && _0x143739 === "params" && _0x54db61(this.componentDrafts).length < PREVIEW_CUSTOM_COMPONENT_LIMIT;
      const _0x3c802b = _0x4138af && _0x143739 === "advanced";
      let _0x4a0914 = false;
      let _0xf94fb1 = false;
      let _0x2e89b5 = false;
      let _0x34798d = false;
      let _0x35ae2c = false;
      const _0x3a45e8 = _0x286b15.dragKind === "input" && _0x143739 === "input";
      const _0x5e4944 = (_0x286b15.dragKind === "param" || _0x286b15.dragKind === "advanced-param") && (_0x143739 === "params" || _0x143739 === "advanced");
      const _0x5a5c15 = _0x2a51f7 && _0x143739 === "prompt" || _0xbec849 || _0x3c802b;
      if (_0x286b15.moved && _0x286b15.didLiveOrder && !_0x3a45e8 && !_0x5e4944 && !_0x5a5c15) {
        this._restorePreviewLayoutSnapshot(_0x286b15.layoutSnapshot);
        _0x4a0914 = true;
        _0xf94fb1 = _0x286b15.dragKind === "input";
        _0x2e89b5 = _0x286b15.dragKind === "param" || _0x286b15.dragKind === "advanced-param";
        _0x34798d = _0x286b15.dragKind === "advanced-param";
      }
      if (_0x286b15.moved && (_0x286b15.dragKind === "param" || _0x286b15.dragKind === "advanced-param")) {
        if (_0x143739 === "params" && _0x286b15.dragKind === "advanced-param") {
          const _0x29725a = this._movePreviewParamToHome(_0x286b15);
          _0x4a0914 = _0x29725a || _0x4a0914;
          _0x2e89b5 = _0x29725a || _0x2e89b5;
          _0x34798d = _0x29725a || _0x34798d;
        } else if (_0x143739 === "advanced" && _0x286b15.dragKind === "param") {
          const _0x23a3b1 = this._movePreviewParamToAdvanced(_0x286b15);
          _0x4a0914 = _0x23a3b1 || _0x4a0914;
          _0x2e89b5 = _0x23a3b1 || _0x2e89b5;
          _0x34798d = _0x23a3b1 || _0x34798d;
        }
      }
      if (_0x286b15.moved && _0x2a51f7 && _0x143739 === "prompt") {
        const _0x4d8c0a = this._movePreviewTextParamToPrompt(_0x286b15);
        _0x4a0914 = _0x4d8c0a || _0x4a0914;
        _0x35ae2c = _0x4d8c0a || _0x35ae2c;
        _0x2e89b5 = _0x286b15.dragKind === "param" || _0x2e89b5;
        _0x34798d = _0x286b15.dragKind === "advanced-param" || _0x34798d;
      } else if (_0x286b15.moved && _0x4138af) {
        if (_0xbec849) {
          const _0x5500fd = this._movePreviewPromptToParam(_0x286b15, "home");
          _0x4a0914 = _0x5500fd || _0x4a0914;
          _0x35ae2c = _0x5500fd || _0x35ae2c;
          _0x2e89b5 = _0x5500fd || _0x2e89b5;
        } else if (_0x3c802b) {
          const _0x40b1a3 = this._movePreviewPromptToParam(_0x286b15, "advanced");
          _0x4a0914 = _0x40b1a3 || _0x4a0914;
          _0x35ae2c = _0x40b1a3 || _0x35ae2c;
          _0x34798d = _0x40b1a3 || _0x34798d;
        }
      }
      this._clearPreviewDragState();
      const _0x4377f4 = this._refreshBundleFromComponents({
        renderPreview: false
      });
      if (_0x4a0914 || _0x35ae2c) {
        this._patchPreviewWithoutRebuild(_0x4377f4, {
          renderInputs: _0xf94fb1,
          renderParams: _0x2e89b5,
          renderAdvanced: _0x34798d,
          renderPrompt: _0x35ae2c
        });
        if (_0x1e74d1) {
          this._animatePreviewComponentFromRect(_0x286b15.index, _0x1e74d1);
        }
      }
    }
  }
  return new _0x3d53e6();
}