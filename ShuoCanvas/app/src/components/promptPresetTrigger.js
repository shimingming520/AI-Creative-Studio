import { onLocaleChange, t } from "../i18n/index.js";
import { isPromptPresetNodeTypeSupported } from "../modules/promptPresets.js";
import { closeSlashMenu, openPromptPresetMenu } from "../modules/slashMenu.js";
const PROMPT_PRESET_BOOK_ICON_HTML = "\n  <svg viewBox=\"0 0 24 24\" fill=\"none\" aria-hidden=\"true\">\n    <path d=\"M3.5 5.25A2.25 2.25 0 0 1 5.75 3h4.5c.97 0 1.75.78 1.75 1.75V20c0-1.1-.9-2-2-2H3.5V5.25Z\"/>\n    <path d=\"M20.5 5.25A2.25 2.25 0 0 0 18.25 3h-4.5C12.78 3 12 3.78 12 4.75V20c0-1.1.9-2 2-2h6.5V5.25Z\"/>\n  </svg>";
export function createPromptPresetTriggerController({
  panel: _0x492d3b,
  getPromptEl: _0x4343d0,
  getNodeType: _0x356048,
  getNodeId: _0x1f65e3,
  onGenerate: _0x4a8b7f,
  openMenu = openPromptPresetMenu,
  closeMenu = closeSlashMenu
} = {}) {
  if (!_0x492d3b) {
    return {
      sync() {},
      remove() {}
    };
  }
  const _0x33c589 = _0x492d3b.ownerDocument || globalThis.document;
  let _0x572371 = _0x492d3b.querySelector?.(".prompt-preset-trigger") || null;
  if (!_0x572371) {
    _0x572371 = _0x33c589?.createElement?.("button") || null;
    if (!_0x572371) {
      return {
        sync() {},
        remove() {}
      };
    }
    _0x572371.type = "button";
    _0x572371.className = "prompt-preset-trigger";
    _0x572371.innerHTML = PROMPT_PRESET_BOOK_ICON_HTML;
    _0x572371.setAttribute("aria-haspopup", "menu");
    _0x572371.setAttribute("aria-expanded", "false");
    _0x492d3b.appendChild(_0x572371);
  }
  _0x492d3b.classList?.add("has-prompt-preset-trigger");
  const _0x5603f1 = _0x41e5b9 => {
    const _0x19d8da = _0x41e5b9 === true;
    _0x572371?.setAttribute("aria-expanded", String(_0x19d8da));
    _0x572371?.classList?.toggle?.("is-open", _0x19d8da);
  };
  const _0x5e2d74 = () => {
    const _0x2c70f5 = t("promptPresets.triggerLabel");
    _0x572371.title = _0x2c70f5;
    _0x572371.setAttribute("aria-label", _0x2c70f5);
    const _0x1699e0 = isPromptPresetNodeTypeSupported(_0x356048?.());
    _0x572371.hidden = !_0x1699e0;
    if (!_0x1699e0) {
      _0x5603f1(false);
    }
  };
  const _0x36ba72 = _0x4b301c => {
    _0x4b301c.preventDefault();
    _0x4b301c.stopPropagation();
  };
  const _0x273bd1 = _0x3214a5 => {
    _0x3214a5.preventDefault();
    _0x3214a5.stopPropagation();
    if (_0x572371.getAttribute("aria-expanded") === "true") {
      closeMenu();
      return;
    }
    const _0x855d5e = _0x4343d0?.();
    const _0x119a8f = _0x356048?.();
    if (!_0x855d5e || !isPromptPresetNodeTypeSupported(_0x119a8f)) {
      return;
    }
    openMenu({
      promptEl: _0x855d5e,
      nodeType: _0x119a8f,
      nodeId: _0x1f65e3?.(),
      onGenerate: _0x4a8b7f,
      anchorEl: _0x572371,
      placement: "above-end",
      onOpenChange: _0x5603f1
    });
    _0x855d5e.focus?.({
      preventScroll: true
    });
  };
  _0x572371.addEventListener("pointerdown", _0x36ba72);
  _0x572371.addEventListener("mousedown", _0x36ba72);
  _0x572371.addEventListener("click", _0x273bd1);
  _0x5e2d74();
  const _0x78ba01 = onLocaleChange(_0x5e2d74);
  const _0x3d0abd = () => {
    _0x78ba01?.();
    if (_0x572371?.getAttribute("aria-expanded") === "true") {
      closeMenu();
    }
    _0x572371?.remove?.();
    _0x572371 = null;
    _0x492d3b.classList?.remove("has-prompt-preset-trigger");
  };
  return {
    sync: _0x5e2d74,
    remove: _0x3d0abd
  };
}