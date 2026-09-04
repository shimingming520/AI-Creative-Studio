import { buildGenerateTextRequest } from "../../api/aiTextApi.js";
import a510_0xb6a92b from "../core/stores/appStore.js";
import { getDisplayModelName } from "../modules/providers.js";
import { bindRefThumbHoverPreview } from "../modules/refThumbHoverPreview.js";
import { checkSlashTrigger, handleSlashKeyboardNavigation } from "../modules/slashMenu.js";
import { activateMenuKeyboard } from "../modules/floatingMenuKeyboard.js";
import { _checkAtTrigger, _handleMentionMenuKeyboard, _handlePillHover, _handlePillKeyboard, _handlePillOut, _rehydratePromptPills, _syncEdgesOrderFromPills, flushPromptHtmlCommit, handlePromptPaste, handlePromptSelectAll, schedulePromptHtmlCommit, shouldSubmitPromptByKeyboard } from "../modules/nodePromptShared.js";
import { sanitizePromptHtml } from "../utils/dom.js";
import { DEBUG_WRENCH_ICON_HTML, formatFinalApiDebugRequest } from "../utils/debugRequestPreview.js";
import { getNodeDefaultSize } from "../services/fileService.js";
import { buildTextModelSmallIconHTML, buildTextProviderMenuGroupsHTML } from "./aigenText/apimartTextModelMenu.js";
import { getCustomTextModels, saveCustomTextModels } from "./aigenText/customTextModels.js";
import { setupPromptBoxResize, syncPromptBoxSizeFromData } from "./aigenText/promptBoxResizeUi.js";
import { createPromptAttachmentButtonHTML } from "./refAttachmentButton.js";
import { createPromptPresetTriggerController } from "./promptPresetTrigger.js";
import { bindNodeFooterController, bindNodeModelMenuTrigger, closeNodeFooterMenus } from "./shared/nodeFooterControls.js";
import { t } from "../i18n/index.js";
function sharedPromptPanelText(_0x5c4fa3, _0x2570de = {}) {
  return t("sharedPromptPanel." + _0x5c4fa3, _0x2570de);
}
function escapeSharedPromptPanelHtml(_0x2350d5) {
  return String(_0x2350d5 ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
export function buildSharedPromptPanel(_0x31b2c5, _0x589885 = {}) {
  const _0x3a502b = document.createElement("div");
  _0x3a502b.className = "text-prompt-panel";
  _0x31b2c5._promptPanel = _0x3a502b;
  const _0x42fff6 = () => typeof a510_0xb6a92b.getStateRaw === "function" ? a510_0xb6a92b.getStateRaw() : a510_0xb6a92b.getState();
  _0x3a502b.addEventListener("pointerdown", _0x199c5c => {
    _0x199c5c.stopPropagation();
  });
  _0x3a502b.addEventListener("dblclick", _0x954e0f => {
    if (!_0x954e0f.target.closest(".prompt-textarea")) {
      _0x954e0f.preventDefault();
      _0x954e0f.stopPropagation();
    }
  });
  _0x31b2c5.refBarEl = document.createElement("div");
  _0x31b2c5.refBarEl.className = "node-ref-bar";
  _0x3a502b.appendChild(_0x31b2c5.refBarEl);
  _0x31b2c5.refBarEl.addEventListener("click", _0x42dbba => {
    const _0x63402f = _0x42dbba.target.closest(".ref-thumb-delete");
    if (_0x63402f) {
      _0x42dbba.stopPropagation();
      _0x42dbba.preventDefault();
      const _0x57fe04 = _0x63402f.closest(".ref-thumb-wrap")?.dataset.edgeId;
      if (_0x57fe04) {
        a510_0xb6a92b.removeEdge(_0x57fe04);
      }
      return;
    }
    const _0x456469 = _0x42dbba.target.closest(".prompt-attachment-btn");
    if (!_0x456469) {
      return;
    }
    if (_0x42dbba._pickConnectHandled) {
      return;
    }
    _0x42dbba.stopPropagation();
    _0x42dbba.preventDefault();
    const _0x20a577 = a510_0xb6a92b.getState().pickConnectMode;
    if (_0x20a577 && _0x20a577.active && _0x20a577.sourceNodeId === _0x31b2c5.nodeId) {
      a510_0xb6a92b.setPickConnectMode({
        active: false
      });
    } else {
      a510_0xb6a92b.setPickConnectMode({
        active: true,
        sourceNodeId: _0x31b2c5.nodeId,
        handleDirection: "left"
      });
    }
  });
  _0x31b2c5.refBarEl.addEventListener("pointerdown", _0x54619f => {
    if (_0x54619f.target.closest(".prompt-attachment-btn, .ref-thumb-delete")) {
      _0x54619f.stopPropagation();
    }
  });
  _0x31b2c5._unbindRefThumbHoverPreview?.();
  _0x31b2c5._unbindRefThumbHoverPreview = bindRefThumbHoverPreview(_0x31b2c5.refBarEl);
  const _0xdd0f4a = document.createElement("div");
  _0xdd0f4a.className = "prompt-input-wrapper";
  _0xdd0f4a.classList.add("is-resizable");
  _0x31b2c5._promptInputWrap = _0xdd0f4a;
  _0x31b2c5.promptEl = document.createElement("div");
  _0x31b2c5.promptEl.className = "prompt-textarea custom-textarea";
  _0x31b2c5.promptEl.contentEditable = "true";
  _0x31b2c5.promptEl.spellcheck = false;
  _0x31b2c5.promptEl.dataset.placeholder = _0x589885.placeholder || sharedPromptPanelText("promptPlaceholder");
  _0x31b2c5._flushPromptHtmlCommit = () => flushPromptHtmlCommit(_0x31b2c5);
  _0x31b2c5.promptEl.addEventListener("input", _0x3a1589 => {
    schedulePromptHtmlCommit(_0x31b2c5);
    _checkAtTrigger(_0x31b2c5, _0x3a1589);
    checkSlashTrigger(_0x3a1589, {
      promptEl: _0x31b2c5.promptEl,
      nodeType: _0x31b2c5._data?.type,
      nodeId: _0x31b2c5.nodeId,
      onGenerate: (_0x7b932d, _0x34a4ed) => _0x31b2c5._onGenerate?.(_0x7b932d, _0x34a4ed)
    });
    _syncEdgesOrderFromPills(_0x31b2c5);
    _0x31b2c5._updateSubmitButtonState?.();
  });
  _0x31b2c5.promptEl.addEventListener("blur", () => {
    flushPromptHtmlCommit(_0x31b2c5);
  });
  _0x31b2c5.promptEl.addEventListener("mouseover", _0x1c4be4 => _handlePillHover(_0x1c4be4, _0x31b2c5));
  _0x31b2c5.promptEl.addEventListener("mouseout", _0x4823db => _handlePillOut(_0x4823db, _0x31b2c5));
  _0x31b2c5.promptEl.addEventListener("keydown", _0xde4257 => {
    if (handlePromptSelectAll(_0x31b2c5, _0xde4257)) {
      return;
    }
    if (_handleMentionMenuKeyboard(_0xde4257)) {
      return;
    }
    if (handleSlashKeyboardNavigation(_0xde4257)) {
      return;
    }
    if (shouldSubmitPromptByKeyboard(_0xde4257)) {
      _0xde4257.preventDefault();
      flushPromptHtmlCommit(_0x31b2c5);
      _0x31b2c5.btnEl?.click();
      return;
    }
    _handlePillKeyboard(_0x31b2c5, _0xde4257);
  });
  _0x31b2c5.promptEl.addEventListener("paste", _0x5dfed6 => {
    handlePromptPaste(_0x31b2c5, _0x5dfed6);
  });
  if (_0x31b2c5._data.prompt) {
    _0x31b2c5.promptEl.innerHTML = sanitizePromptHtml(_0x31b2c5._data.prompt);
    _rehydratePromptPills(_0x31b2c5);
  }
  _0xdd0f4a.appendChild(_0x31b2c5.promptEl);
  _0x31b2c5._syncPromptBoxSizeFromData = (_0x1b6155 = _0x31b2c5._data) => syncPromptBoxSizeFromData(_0x31b2c5, _0x1b6155);
  _0x31b2c5._syncPromptBoxSizeFromData(_0x31b2c5._data);
  setupPromptBoxResize(_0x31b2c5, {
    store: a510_0xb6a92b,
    getStateSnapshot: _0x42fff6
  });
  _0x3a502b.appendChild(_0xdd0f4a);
  const _0x2d5f7f = document.createElement("div");
  _0x2d5f7f.className = "prompt-panel-footer text-prompt-actions";
  const _0x48ab0e = [];
  _0x31b2c5._promptPresetTrigger?.remove?.();
  _0x31b2c5._promptPresetTrigger = createPromptPresetTriggerController({
    panel: _0x3a502b,
    getPromptEl: () => _0x31b2c5.promptEl,
    getNodeType: () => _0x31b2c5._data?.type,
    getNodeId: () => _0x31b2c5.nodeId,
    onGenerate: (_0x1f01c5, _0x53246d) => _0x31b2c5._onGenerate?.(_0x1f01c5, _0x53246d)
  });
  _0x48ab0e.push(() => {
    _0x31b2c5._promptPresetTrigger?.remove();
    _0x31b2c5._promptPresetTrigger = null;
  });
  if (_0x589885?.modelMenu) {
    const _0x6f670 = _0x589885.modelMenu;
    const _0x2cca0c = String(_0x6f670.provider || "volcengine").trim();
    const _0xbef64e = Array.isArray(_0x6f670.providers) ? _0x6f670.providers.map(_0x2f2dae => String(_0x2f2dae).toLowerCase()) : null;
    const _0x4a344e = _0x6f670.allowCustomModels !== false;
    const _0x1f3faf = String(_0x6f670.model || _0x31b2c5._data?.model || _0x31b2c5._data?.storyboardScript?.model || _0x6f670.defaultModel || "").trim();
    const _0x5e0dde = () => {
      const _0x5d5f02 = buildTextModelSmallIconHTML(_0x1f3faf);
      if (_0x5d5f02) {
        return _0x5d5f02;
      }
      if (_0x2cca0c === "custom" || _0x2cca0c === "openai") {
        return "<div class=\"text-model-icon-small text-model-icon-badge\">OA</div>";
      }
      return "<div class=\"text-model-icon-small text-model-icon-badge\">AI</div>";
    };
    const _0x1d7a3e = document.createElement("div");
    _0x1d7a3e.className = "img-model-pills";
    _0x1d7a3e.innerHTML = "\n      <div class=\"img-model-wrap\">\n        <button type=\"button\" class=\"img-pill-btn img-model-btn-trigger\">\n          " + _0x5e0dde() + "\n          <span class=\"img-model-label\">" + getDisplayModelName(_0x1f3faf) + "</span>\n          <svg width=\"10\" height=\"10\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" class=\"node-menu-caret\"><polyline points=\"6 9 12 15 18 9\"></polyline></svg>\n        </button>\n        <div class=\"floating-menu img-model-menu node-model-menu\">\n          " + (_0x4a344e ? "<div class=\"custom-group-header floating-menu-item node-menu-group-header\" data-custom-toggle data-node-menu-submenu=\".custom-submenu\">\n            <div class=\"text-model-icon text-model-icon-badge\">OA</div>\n            <div class=\"fmi-content\">\n              <div class=\"fmi-title\">" + escapeSharedPromptPanelHtml(sharedPromptPanelText("customModelTitle")) + "</div>\n              <div class=\"fmi-sub\">" + escapeSharedPromptPanelHtml(sharedPromptPanelText("customModelSubtitle")) + "</div>\n            </div>\n            <svg width=\"10\" height=\"10\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2.5\" class=\"node-menu-caret\"><polyline points=\"9 18 15 12 9 6\"></polyline></svg>\n          </div>\n          <div class=\"custom-submenu node-model-submenu node-menu-submenu\"></div>" : "") + "\n          " + buildTextProviderMenuGroupsHTML(_0x1f3faf, {
      providers: _0xbef64e
    }) + "\n        </div>\n      </div>";
    _0x2d5f7f.appendChild(_0x1d7a3e);
    const _0x4ae45f = _0x1d7a3e.querySelector(".img-model-wrap");
    const _0x4c64d1 = _0x1d7a3e.querySelector(".img-model-btn-trigger");
    const _0x348063 = _0x1d7a3e.querySelector(".img-model-menu");
    const _0x293fcd = _0x1d7a3e.querySelector(".img-model-label");
    const _0xb760d2 = Object.freeze({
      grsai: _0x348063?.querySelector(".grsai-submenu"),
      ppio: _0x348063?.querySelector(".ppio-submenu"),
      apimart: _0x348063?.querySelector(".apimart-submenu"),
      agnes: _0x348063?.querySelector(".agnes-submenu"),
      runninghub: _0x348063?.querySelector(".runninghub-submenu"),
      volcengine: _0x348063?.querySelector(".volcengine-submenu")
    });
    const _0x9b1bfc = _0x3ddac0 => {
      const _0x1fc96f = _0x3ddac0?.querySelector("img, svg, div");
      const _0x229a86 = _0x4c64d1?.firstElementChild;
      if (!_0x229a86 || !_0x1fc96f || _0x1fc96f.classList?.contains("fmi-content")) {
        return;
      }
      const _0x23530f = _0x1fc96f.cloneNode(true);
      _0x23530f.removeAttribute?.("style");
      _0x23530f.classList?.remove("text-model-icon", "node-menu-icon");
      _0x23530f.classList?.add("text-model-icon-small");
      if (_0x23530f.tagName?.toLowerCase() === "svg") {
        _0x23530f.setAttribute("width", "12");
        _0x23530f.setAttribute("height", "12");
        _0x23530f.classList.add("node-menu-icon-small");
      }
      _0x229a86.replaceWith(_0x23530f);
    };
    const _0x212063 = (_0x2e339b, _0x230a0a, _0x2471a1) => {
      const _0x245840 = String(_0x2e339b?.dataset?.value || "").trim();
      if (!_0x245840) {
        return;
      }
      const _0x23afdf = String(_0x2e339b.dataset.provider || _0x230a0a || _0x2cca0c).trim();
      const _0x5c97c0 = _0x2e339b.querySelector(".fmi-title") || _0x2e339b.querySelector(".floating-menu-label") || _0x2e339b.querySelector(".custom-model-label");
      if (_0x293fcd) {
        _0x293fcd.textContent = _0x5c97c0?.textContent || _0x245840;
      }
      _0x348063?.querySelectorAll(".floating-menu-item").forEach(_0x281b9d => _0x281b9d.classList.remove("active"));
      _0x2e339b.classList.add("active");
      _0x348063?.classList.remove("show");
      if (_0x2471a1) {
        _0x2471a1.style.display = "none";
      }
      _0x9b1bfc(_0x2e339b);
      if (typeof _0x6f670.onSelect === "function") {
        _0x6f670.onSelect({
          modelId: _0x245840,
          provider: _0x23afdf,
          item: _0x2e339b,
          self: _0x31b2c5
        });
      } else {
        a510_0xb6a92b.updateNodeData(_0x31b2c5.nodeId, {
          model: _0x245840,
          provider: _0x23afdf
        });
      }
    };
    _0x348063?.addEventListener("click", _0x5938e1 => {
      const _0x2173ed = _0x5938e1.target?.closest?.(".floating-menu-item");
      if (!_0x2173ed || !_0x348063.contains(_0x2173ed)) {
        return;
      }
      if (!_0x2173ed.dataset.value) {
        return;
      }
      const _0x1ec9c7 = Object.entries(_0xb760d2).find(([, _0x2b4702]) => _0x2b4702?.contains(_0x2173ed));
      if (_0x1ec9c7) {
        _0x5938e1.stopPropagation();
        _0x212063(_0x2173ed, _0x1ec9c7[0], _0x1ec9c7[1]);
        return;
      }
      if (!_0x4a344e) {
        return;
      }
      const _0x358bba = _0x348063.querySelector(".custom-submenu");
      if (_0x358bba?.contains(_0x2173ed)) {
        _0x5938e1.stopPropagation();
        _0x212063(_0x2173ed, "custom", _0x358bba);
      }
    });
    const _0xd5838c = _0x348063?.querySelector(".custom-submenu");
    if (_0x4a344e) {
      _0xd5838c?.addEventListener("pointerdown", _0x470e0a => {
        _0x470e0a.stopPropagation();
      });
    }
    const _0x21c82b = () => {
      if (!_0x4a344e || !_0xd5838c) {
        return;
      }
      const _0x3781dc = getCustomTextModels();
      const _0xc8e0b2 = _0x31b2c5._data?.model || "";
      _0xd5838c.replaceChildren();
      _0x3781dc.forEach((_0xf1dc1c, _0x5dceff) => {
        const _0x414c90 = document.createElement("div");
        _0x414c90.className = "floating-menu-item custom-model-item" + (_0xc8e0b2 === _0xf1dc1c ? " active" : "");
        _0x414c90.dataset.value = _0xf1dc1c;
        const _0x30755f = document.createElement("div");
        _0x30755f.className = "text-model-icon text-model-icon-badge custom-model-icon";
        _0x30755f.textContent = "OA";
        const _0x403642 = document.createElement("span");
        _0x403642.className = "custom-model-label";
        _0x403642.textContent = _0xf1dc1c;
        const _0x5c1531 = document.createElement("span");
        _0x5c1531.className = "custom-model-del";
        _0x5c1531.textContent = "×";
        _0x414c90.appendChild(_0x30755f);
        _0x414c90.appendChild(_0x403642);
        _0x414c90.appendChild(_0x5c1531);
        _0x414c90.addEventListener("mouseenter", () => {
          _0x5c1531.classList.add("show");
        });
        _0x414c90.addEventListener("mouseleave", () => {
          _0x5c1531.classList.remove("show");
        });
        _0x5c1531.addEventListener("click", _0x19d624 => {
          _0x19d624.stopPropagation();
          saveCustomTextModels(getCustomTextModels().filter((_0x32b45b, _0x21afbf) => _0x21afbf !== _0x5dceff));
          _0x21c82b();
        });
        _0xd5838c.appendChild(_0x414c90);
      });
      if (_0x3781dc.length > 0) {
        const _0x54aff9 = document.createElement("div");
        _0x54aff9.className = "custom-model-separator";
        _0xd5838c.appendChild(_0x54aff9);
      }
      const _0x45a128 = document.createElement("div");
      _0x45a128.className = "floating-menu-item custom-model-add";
      _0x45a128.innerHTML = "\n        <svg class=\"custom-model-add-icon\" width=\"14\" height=\"14\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><line x1=\"12\" y1=\"5\" x2=\"12\" y2=\"19\"/><line x1=\"5\" y1=\"12\" x2=\"19\" y2=\"12\"/></svg>\n        <span class=\"custom-model-add-label\">" + escapeSharedPromptPanelHtml(sharedPromptPanelText("addModel")) + "</span>";
      _0x45a128.addEventListener("click", _0x385275 => {
        _0x385275.stopPropagation();
        _0x45a128.replaceChildren();
        _0x45a128.classList.add("editing");
        const _0xe2b99 = document.createElement("input");
        _0xe2b99.type = "text";
        _0xe2b99.placeholder = sharedPromptPanelText("modelNamePlaceholder");
        _0xe2b99.className = "custom-model-input";
        const _0x396bc5 = document.createElement("button");
        _0x396bc5.type = "button";
        _0x396bc5.textContent = sharedPromptPanelText("confirm");
        _0x396bc5.className = "custom-model-confirm";
        const _0x1f08b8 = () => {
          const _0xbb0dda = _0xe2b99.value.trim();
          if (!_0xbb0dda) {
            return;
          }
          const _0x2ded49 = getCustomTextModels();
          if (!_0x2ded49.includes(_0xbb0dda)) {
            _0x2ded49.push(_0xbb0dda);
            saveCustomTextModels(_0x2ded49);
          }
          _0x21c82b();
        };
        _0xe2b99.addEventListener("keydown", _0x1d7e5a => {
          _0x1d7e5a.stopPropagation();
          if (_0x1d7e5a.key === "Enter") {
            _0x1f08b8();
          }
        });
        _0xe2b99.addEventListener("keyup", _0x3809fa => _0x3809fa.stopPropagation());
        _0xe2b99.addEventListener("keypress", _0x2d2c88 => _0x2d2c88.stopPropagation());
        _0xe2b99.addEventListener("click", _0x2415c7 => _0x2415c7.stopPropagation());
        _0x396bc5.addEventListener("click", _0x56a24b => {
          _0x56a24b.stopPropagation();
          _0x1f08b8();
        });
        _0x45a128.appendChild(_0xe2b99);
        _0x45a128.appendChild(_0x396bc5);
        _0xe2b99.focus();
      });
      _0xd5838c.appendChild(_0x45a128);
    };
    if (_0x4a344e) {
      _0x21c82b();
    }
    const _0xcef271 = bindNodeModelMenuTrigger({
      root: _0x2d5f7f,
      trigger: _0x4c64d1,
      menu: _0x348063,
      closeOthers: () => closeNodeFooterMenus(_0x2d5f7f, _0x348063),
      activateMenuKeyboard: activateMenuKeyboard
    });
    const _0x1c276f = bindNodeFooterController(_0x2d5f7f);
    _0x48ab0e.push(_0xcef271, _0x1c276f);
    _0x31b2c5.modelWrap = _0x4ae45f;
  }
  const _0x1a633d = document.createElement("div");
  _0x1a633d.className = "prompt-actions";
  const _0x55f75a = document.createElement("button");
  _0x55f75a.type = "button";
  _0x55f75a.className = "prompt-submit debug-wrench-btn";
  _0x55f75a.title = sharedPromptPanelText("debugApiParams");
  _0x55f75a.innerHTML = DEBUG_WRENCH_ICON_HTML;
  _0x55f75a.addEventListener("click", async _0x423b8a => {
    _0x423b8a.stopPropagation();
    flushPromptHtmlCommit(_0x31b2c5);
    let _0x1a8f9a;
    if (typeof _0x31b2c5._buildPayload === "function") {
      _0x1a8f9a = await _0x31b2c5._buildPayload();
    } else {
      const _0xccc473 = _0x31b2c5.promptEl?.innerText?.trim() || "";
      _0x1a8f9a = {
        prompt: _0xccc473,
        nodeType: _0x31b2c5._data.type
      };
    }
    if (!_0x1a8f9a) {
      return;
    }
    try {
      const _0x22b28d = await buildGenerateTextRequest(_0x1a8f9a);
      const _0x3591d0 = formatFinalApiDebugRequest(_0x22b28d);
      const _0x453c48 = a510_0xb6a92b.getState();
      const _0x5312c6 = _0x31b2c5._data.x + (_0x31b2c5._data.width || 380) + 50;
      const _0x2bd8a0 = _0x31b2c5._data.y;
      const _0x36f3d6 = getNodeDefaultSize("debug");
      let _0x489f82 = Object.values(_0x453c48.nodes).find(_0x5b3a89 => _0x5b3a89.type === "debug");
      if (!_0x489f82) {
        a510_0xb6a92b.addNode({
          id: "debug-" + Date.now(),
          type: "debug",
          x: _0x5312c6,
          y: _0x2bd8a0,
          ..._0x36f3d6,
          name: sharedPromptPanelText("debugNodeName"),
          outputText: _0x3591d0
        });
      } else {
        a510_0xb6a92b.updateNodeData(_0x489f82.id, {
          outputText: _0x3591d0,
          x: _0x5312c6,
          y: _0x2bd8a0
        });
      }
      window.showToast?.(sharedPromptPanelText("debugParamsShown"), "warn");
    } catch (_0x241c2f) {
      window.showToast?.(sharedPromptPanelText("buildRequestFailed", {
        error: _0x241c2f.message
      }), "error");
    }
  });
  _0x31b2c5.btnEl = document.createElement("button");
  _0x31b2c5.btnEl.type = "button";
  _0x31b2c5.btnEl.className = "prompt-submit img-gen-btn";
  _0x31b2c5.btnEl.title = _0x589885.btnTitle || sharedPromptPanelText("generate");
  _0x31b2c5.btnEl.innerHTML = "<svg width=\"14\" height=\"14\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><line x1=\"12\" y1=\"19\" x2=\"12\" y2=\"5\"/><polyline points=\"5 12 12 5 19 12\"/></svg>";
  _0x31b2c5.btnEl.addEventListener("click", _0x18f55e => {
    _0x18f55e.stopPropagation();
    flushPromptHtmlCommit(_0x31b2c5);
    _0x31b2c5._onGenerate?.();
  });
  _0x1a633d.appendChild(_0x55f75a);
  _0x1a633d.appendChild(_0x31b2c5.btnEl);
  _0x2d5f7f.appendChild(_0x1a633d);
  _0x3a502b.appendChild(_0x2d5f7f);
  _0x31b2c5._sharedPanelCleanup = () => {
    _0x48ab0e.forEach(_0x4de274 => _0x4de274?.());
  };
  _0x31b2c5._updateSubmitButtonState?.();
  return _0x3a502b;
}