import { getPromptPresetThumbSrc, getSlashPromptPresetEntries, isPromptPresetNodeTypeSupported, openCustomPresetsManager, shouldInsertPromptForPreset } from "./promptPresets.js";
import a1224_0x1ae846 from "../core/stores/appStore.js";
import { t } from "../i18n/index.js";
import { createSafeSvg, sanitizePromptHtml } from "../utils/dom.js";
import { deferPromptTriggerUntilCompositionEnd, shouldSkipPromptTriggerForBulkInput } from "./promptTriggerComposition.js";
function slashMenuText(_0x171d97, _0x3b9a6c = {}) {
  return t("promptPresets.slash." + _0x171d97, _0x3b9a6c);
}
let _slashMenuEl = null;
export function getSlashMenu() {
  if (!_slashMenuEl) {
    _slashMenuEl = document.getElementById("v2-slash-menu");
    if (!_slashMenuEl) {
      _slashMenuEl = document.createElement("div");
      _slashMenuEl.id = "v2-slash-menu";
      _slashMenuEl.className = "preset-slash-menu";
      document.body.appendChild(_slashMenuEl);
    }
  }
  return _slashMenuEl;
}
let _subMenuState = {
  activeSubmenu: null,
  parentItem: null,
  subItems: [],
  subIndex: -1
};
let _slashViewportUnsubscribe = null;
let _slashOutsideDocClick = null;
let _slashOutsideDocClickTimer = 0;
let _slashPositionState = null;
let _slashCoverPreviewEl = null;
const _slashCoverPreloadCache = new Map();
function resetSubMenuState() {
  _subMenuState = {
    activeSubmenu: null,
    parentItem: null,
    subItems: [],
    subIndex: -1
  };
}
function _appendPresetIcon(_0x18b8e2, _0x358024) {
  if (!_0x18b8e2 || !_0x358024) {
    return;
  }
  const _0x32d883 = String(_0x358024).trim();
  if (_0x32d883.startsWith("<svg")) {
    const _0xec973d = createSafeSvg(_0x32d883);
    if (_0xec973d) {
      _0x18b8e2.appendChild(_0xec973d);
      _0x18b8e2.appendChild(document.createTextNode(" "));
      return;
    }
  }
  _0x18b8e2.appendChild(document.createTextNode(String(_0x358024) + " "));
}
function _getSlashPresetTriggerModeLabel(_0x3fce8d = {}) {
  if (shouldInsertPromptForPreset(_0x3fce8d)) {
    return t("promptPresets.triggerModes.insertPrompt");
  } else {
    return t("promptPresets.triggerModes.direct");
  }
}
function _isSelectableSlashPreset(_0x4818c9 = {}) {
  return _0x4818c9 && Object.prototype.hasOwnProperty.call(_0x4818c9, "template");
}
function _appendSlashPresetTriggerBadge(_0x29e2c0, _0x18b118 = {}) {
  if (!_0x29e2c0) {
    return;
  }
  const _0x5e0018 = document.createElement("span");
  _0x5e0018.className = "preset-slash-trigger-badge";
  _0x5e0018.textContent = _getSlashPresetTriggerModeLabel(_0x18b118);
  _0x29e2c0.appendChild(_0x5e0018);
}
function _getSlashCoverPreview() {
  if (_slashCoverPreviewEl?.isConnected) {
    return _slashCoverPreviewEl;
  }
  const _0x4e9c8a = document.createElement("div");
  _0x4e9c8a.className = "preset-slash-cover-preview";
  const _0x1c90f0 = document.createElement("img");
  _0x1c90f0.className = "preset-slash-cover-preview-img";
  _0x1c90f0.alt = "";
  _0x4e9c8a.appendChild(_0x1c90f0);
  document.body.appendChild(_0x4e9c8a);
  _slashCoverPreviewEl = _0x4e9c8a;
  return _0x4e9c8a;
}
function _hideSlashCoverPreview() {
  const _0x2b0570 = _slashCoverPreviewEl;
  if (!_0x2b0570) {
    return;
  }
  _0x2b0570.classList.remove("is-visible");
}
function _removeSlashCoverPreview() {
  _slashCoverPreviewEl?.remove?.();
  _slashCoverPreviewEl = null;
}
function _preloadSlashCoverPreviewSrc(_0x478e22) {
  const _0x3d8a1c = String(_0x478e22 || "").trim();
  if (!_0x3d8a1c || _slashCoverPreloadCache.has(_0x3d8a1c)) {
    return;
  }
  if (typeof Image !== "function") {
    return;
  }
  let _0xf902f8 = null;
  try {
    _0xf902f8 = new Image();
    _0xf902f8.decoding = "async";
    _0xf902f8.loading = "eager";
    _slashCoverPreloadCache.set(_0x3d8a1c, _0xf902f8);
    _0xf902f8.src = _0x3d8a1c;
    if (typeof _0xf902f8.decode === "function") {
      const _0x23f34a = _0xf902f8.decode();
      _0x23f34a?.catch?.(() => {});
    }
  } catch {
    _slashCoverPreloadCache.delete(_0x3d8a1c);
  }
}
function _positionSlashCoverPreview(_0x107406, _0x9c2427) {
  if (!_0x107406 || !_0x9c2427 || typeof _0x107406.getBoundingClientRect !== "function") {
    return;
  }
  const _0x484ebf = _0x107406.getBoundingClientRect();
  const _0x7f91e7 = window.innerWidth || document.documentElement?.clientWidth || 0;
  const _0x85fa59 = window.innerHeight || document.documentElement?.clientHeight || 0;
  const _0x493f71 = _0x9c2427.offsetWidth || _0x9c2427.getBoundingClientRect?.().width || 220;
  const _0x4def9a = _0x9c2427.offsetHeight || _0x9c2427.getBoundingClientRect?.().height || 220;
  const _0x5b0e84 = 12;
  let _0x4ddb0b = _0x484ebf.right + _0x5b0e84;
  if (_0x7f91e7 > 0 && _0x4ddb0b + _0x493f71 + 8 > _0x7f91e7) {
    _0x4ddb0b = _0x484ebf.left - _0x493f71 - _0x5b0e84;
  }
  let _0x57c9b0 = _0x484ebf.top;
  if (_0x85fa59 > 0 && _0x4def9a > 0) {
    _0x57c9b0 = Math.min(_0x57c9b0, _0x85fa59 - _0x4def9a - 8);
    _0x57c9b0 = Math.max(8, _0x57c9b0);
  }
  _0x9c2427.style.left = Math.max(8, _0x4ddb0b) + "px";
  _0x9c2427.style.top = _0x57c9b0 + "px";
}
function _showSlashCoverPreviewForItem(_0x164c80, _0x421f1a) {
  const _0x570326 = String(_0x421f1a?.dataset?.coverSrc || "").trim();
  if (!_0x570326) {
    _hideSlashCoverPreview();
    return;
  }
  _preloadSlashCoverPreviewSrc(_0x570326);
  const _0x5b7371 = _getSlashCoverPreview();
  const _0x399856 = _0x5b7371?.querySelector?.(".preset-slash-cover-preview-img");
  if (!_0x5b7371 || !_0x399856) {
    return;
  }
  if (_0x399856.src !== _0x570326) {
    _0x399856.src = _0x570326;
  }
  _positionSlashCoverPreview(_0x421f1a, _0x5b7371);
  _0x5b7371.classList.add("is-visible");
}
function _getSlashSubmenuPresetItems(_0x14d6ca) {
  return Array.from(_0x14d6ca?.querySelectorAll?.(".preset-slash-item") || []);
}
function _createSlashSubmenuItem({
  submenu: _0x2da8f6,
  sub: _0x59a670,
  promptEl: _0xd89843,
  nodeId: _0x1a7f87,
  range: _0xccfa82,
  selection: _0x2b325d,
  onGenerate: _0x1db47f,
  onPromptCommit: _0x16a0bf
}) {
  const _0x67b69c = document.createElement("div");
  _0x67b69c.className = "preset-slash-item has-desc";
  const _0x5b7a4d = getPromptPresetThumbSrc(_0x59a670);
  if (_0x5b7a4d) {
    _0x67b69c.classList.add("has-cover-preview");
    _0x67b69c.dataset.coverSrc = _0x5b7a4d;
    _preloadSlashCoverPreviewSrc(_0x5b7a4d);
  }
  if (_isSelectableSlashPreset(_0x59a670)) {
    _0x67b69c.classList.add("has-trigger-badge");
  }
  const _0x7a780 = document.createElement("div");
  _0x7a780.className = "preset-slash-title-wrap";
  const _0x16aafe = document.createElement("div");
  _0x16aafe.className = "preset-slash-title";
  if (_0x59a670.icon) {
    _appendPresetIcon(_0x16aafe, _0x59a670.icon);
  }
  _0x16aafe.appendChild(document.createTextNode(_0x59a670.title || ""));
  const _0x19568f = document.createElement("div");
  _0x19568f.className = "preset-slash-desc";
  _0x19568f.textContent = _0x59a670.desc || _0x59a670.template || "";
  _0x7a780.appendChild(_0x16aafe);
  _0x7a780.appendChild(_0x19568f);
  _0x67b69c.appendChild(_0x7a780);
  if (_isSelectableSlashPreset(_0x59a670)) {
    _appendSlashPresetTriggerBadge(_0x67b69c, _0x59a670);
  }
  _0x67b69c.addEventListener("mouseenter", () => {
    _getSlashSubmenuPresetItems(_0x2da8f6).forEach(_0x1a02f8 => _0x1a02f8.classList.remove("active"));
    _0x67b69c.classList.add("active");
    _showSlashCoverPreviewForItem(_0x2da8f6, _0x67b69c);
  });
  _0x67b69c.addEventListener("mouseleave", () => {
    _hideSlashCoverPreview(_0x2da8f6);
  });
  _0x67b69c.addEventListener("mousedown", _0x4e9770 => {
    _0x4e9770.preventDefault();
    _0x4e9770.stopPropagation();
    _selectPromptPreset({
      promptEl: _0xd89843,
      nodeId: _0x1a7f87,
      preset: _0x59a670,
      range: _0xccfa82,
      selection: _0x2b325d,
      onGenerate: _0x1db47f,
      onPromptCommit: _0x16a0bf
    });
  });
  return _0x67b69c;
}
function _isSlashNodeConnected(_0x173458) {
  if (!_0x173458) {
    return false;
  }
  if (_0x173458.isConnected === true) {
    return true;
  }
  if (typeof document === "undefined") {
    return true;
  }
  if (typeof document.body?.contains === "function") {
    return document.body.contains(_0x173458);
  } else {
    return true;
  }
}
function _clearSlashOutsideDocClick() {
  if (_slashOutsideDocClickTimer) {
    clearTimeout(_slashOutsideDocClickTimer);
    _slashOutsideDocClickTimer = 0;
  }
  if (_slashOutsideDocClick && typeof document !== "undefined") {
    document.removeEventListener?.("mousedown", _slashOutsideDocClick);
  }
  _slashOutsideDocClick = null;
}
function _cleanupSlashMenuLifecycle() {
  const _0x23dc43 = _slashPositionState?.onOpenChange;
  _clearSlashOutsideDocClick();
  if (_slashViewportUnsubscribe) {
    _slashViewportUnsubscribe();
    _slashViewportUnsubscribe = null;
  }
  _slashPositionState = null;
  _0x23dc43?.(false);
}
function _getSlashAnchorRect(_0x40eb29) {
  if (!_0x40eb29 || typeof _0x40eb29.getBoundingClientRect !== "function" || !_isSlashNodeConnected(_0x40eb29)) {
    return null;
  }
  return _0x40eb29.getBoundingClientRect();
}
function _positionSlashSubmenu(_0x307c1a, _0xc5d42a) {
  if (!_0x307c1a || !_0xc5d42a || typeof _0x307c1a.getBoundingClientRect !== "function") {
    return;
  }
  const _0x577434 = _0x307c1a.getBoundingClientRect();
  const _0x3a418d = window.innerWidth || document.documentElement?.clientWidth || 0;
  const _0x3b236c = _0xc5d42a.offsetWidth || _0xc5d42a.getBoundingClientRect?.().width || 280;
  let _0x543353 = _0x577434.right + 6;
  if (_0x3a418d > 0 && _0x543353 + _0x3b236c + 8 > _0x3a418d) {
    _0x543353 = _0x577434.left - _0x3b236c - 6;
  }
  _0xc5d42a.style.left = Math.max(8, _0x543353) + "px";
  const _0x1134a6 = window.innerHeight || document.documentElement?.clientHeight || 0;
  const _0x4664f4 = _0xc5d42a.offsetHeight || _0xc5d42a.getBoundingClientRect?.().height || 0;
  let _0x1e91cc = _0x577434.top;
  if (_0x1134a6 > 0 && _0x4664f4 > 0) {
    _0x1e91cc = Math.min(_0x1e91cc, _0x1134a6 - _0x4664f4 - 8);
    _0x1e91cc = Math.max(8, _0x1e91cc);
  }
  _0xc5d42a.style.top = _0x1e91cc + "px";
  const _0x433b30 = _0xc5d42a.querySelector?.(".preset-slash-item.active.has-cover-preview");
  if (_0x433b30) {
    _showSlashCoverPreviewForItem(_0xc5d42a, _0x433b30);
  }
}
function _syncOpenSlashSubmenus() {
  const _0x191fed = _slashPositionState?.menu || _slashMenuEl;
  if (!_0x191fed) {
    return;
  }
  document.querySelectorAll?.(".preset-slash-submenu").forEach(_0x470d0b => {
    if (!_0x470d0b.classList?.contains("open")) {
      return;
    }
    const _0x55e2f9 = _0x470d0b.dataset?.parentItem || "";
    if (!_0x55e2f9) {
      return;
    }
    const _0x3b7ef5 = Array.from(_0x191fed.children || []).find(_0x3e7d07 => _0x3e7d07.dataset?.itemId === _0x55e2f9);
    _positionSlashSubmenu(_0x3b7ef5, _0x470d0b);
  });
}
function _positionSlashMenu() {
  const _0x4c01e3 = _slashPositionState;
  const _0x1d8f46 = _0x4c01e3?.menu;
  if (!_0x4c01e3 || !_0x1d8f46 || !_0x1d8f46.classList?.contains("open")) {
    return;
  }
  const _0x5ea3cd = _getSlashAnchorRect(_0x4c01e3.anchorEl);
  if (!_0x5ea3cd) {
    closeSlashMenu();
    return;
  }
  const _0x3982a5 = _0x1d8f46.offsetHeight || _0x4c01e3.menuHeight || 280;
  _0x4c01e3.menuHeight = _0x3982a5;
  _0x1d8f46.style.visibility = "visible";
  if (_0x4c01e3.placement === "above-end") {
    const _0xcf20ae = _0x1d8f46.offsetWidth || 280;
    const _0x5b7729 = window.innerWidth || document.documentElement?.clientWidth || 0;
    const _0x9fbb77 = _0x5ea3cd.right - _0xcf20ae;
    const _0x5d7ebf = _0x5b7729 > 0 ? _0x5b7729 - _0xcf20ae - 8 : _0x9fbb77;
    _0x1d8f46.style.left = Math.max(8, Math.min(_0x9fbb77, _0x5d7ebf)) + "px";
    _0x1d8f46.style.top = Math.max(8, _0x5ea3cd.top - _0x3982a5 - 8) + "px";
    _0x1d8f46.style.transformOrigin = "bottom right";
    _syncOpenSlashSubmenus();
    return;
  }
  _0x1d8f46.style.left = _0x5ea3cd.left + "px";
  if (_0x5ea3cd.top - _0x3982a5 < 0) {
    _0x1d8f46.style.transformOrigin = "top left";
    _0x1d8f46.style.top = _0x5ea3cd.bottom + 8 + "px";
  } else {
    _0x1d8f46.style.transformOrigin = "bottom left";
    _0x1d8f46.style.top = _0x5ea3cd.top - _0x3982a5 - 8 + "px";
  }
  _syncOpenSlashSubmenus();
}
function _watchSlashViewport() {
  if (typeof a1224_0x1ae846.subscribeSelector !== "function") {
    return;
  }
  if (_slashViewportUnsubscribe) {
    _slashViewportUnsubscribe();
  }
  _slashViewportUnsubscribe = a1224_0x1ae846.subscribeSelector(_0x14b168 => _0x14b168.viewport, () => _positionSlashMenu());
}
function _bindSlashOutsideDocClick(_0xe32d42) {
  _clearSlashOutsideDocClick();
  _slashOutsideDocClick = _0x4e1343 => {
    const _0xd6f82e = Array.from(document.querySelectorAll?.(".preset-slash-submenu") || []).some(_0x24e0b9 => _0x24e0b9.contains?.(_0x4e1343.target));
    if (!_0xe32d42.contains(_0x4e1343.target) && !_0xd6f82e) {
      closeSlashMenu();
    }
  };
  _slashOutsideDocClickTimer = setTimeout(() => {
    _slashOutsideDocClickTimer = 0;
    if (_slashOutsideDocClick) {
      document.addEventListener?.("mousedown", _slashOutsideDocClick);
    }
  }, 10);
}
export function closeSlashMenu() {
  _cleanupSlashMenuLifecycle();
  if (typeof document === "undefined") {
    resetSubMenuState();
    return;
  }
  const _0x14436e = getSlashMenu();
  _0x14436e.classList.remove("open");
  document.querySelectorAll(".preset-slash-submenu").forEach(_0x180dbc => _0x180dbc.remove());
  _removeSlashCoverPreview();
  _slashCoverPreloadCache.clear();
  _0x14436e.replaceChildren();
  resetSubMenuState();
}
function _removeSlashTriggerText(_0x54c89b, _0xf8cfb5) {
  const _0x5bec1f = _0x54c89b?.startContainer;
  if (!_0x5bec1f || _0x5bec1f.nodeType !== Node.TEXT_NODE) {
    return;
  }
  const _0x5138ab = _0x5bec1f.textContent;
  const _0x59c3cf = _0x54c89b.startOffset;
  const _0x5e1ca4 = Math.max(_0x5138ab.lastIndexOf("/", _0x59c3cf - 1), _0x5138ab.lastIndexOf("／", _0x59c3cf - 1));
  if (_0x5e1ca4 === -1) {
    return;
  }
  _0x5bec1f.textContent = _0x5138ab.substring(0, _0x5e1ca4) + _0x5138ab.substring(_0x59c3cf);
  _0x54c89b.setStart(_0x5bec1f, _0x5e1ca4);
  _0x54c89b.setEnd(_0x5bec1f, _0x5e1ca4);
  _0xf8cfb5.removeAllRanges();
  _0xf8cfb5.addRange(_0x54c89b);
}
function _selectPromptPreset({
  promptEl: _0x19adfd,
  nodeId: _0xb5a11d,
  preset: _0x1f9fe0,
  range: _0x52b726,
  selection: _0x3e0858,
  onGenerate: _0xbc990a,
  onPromptCommit: _0x445c83
}) {
  closeSlashMenu();
  _removeSlashTriggerText(_0x52b726, _0x3e0858);
  _0x19adfd.querySelectorAll(".preset-pill").forEach(_0x28e5b6 => _0x28e5b6.remove());
  const _0x463e57 = sanitizePromptHtml(_0x19adfd.innerHTML);
  if (typeof _0x445c83 === "function") {
    _0x445c83(_0x463e57);
  } else {
    a1224_0x1ae846.updateNodeData(_0xb5a11d, {
      prompt: _0x463e57
    });
  }
  setTimeout(() => {
    _0xbc990a?.(_0x1f9fe0?.template, {
      insertPrompt: shouldInsertPromptForPreset(_0x1f9fe0)
    });
  }, 50);
}
export function checkSlashTrigger(_0xb79d6c, {
  promptEl: _0x4cceaf,
  nodeType: _0x431d4a,
  nodeId: _0x19d0aa,
  onGenerate: _0x59ba86,
  explicit = false,
  anchorEl = null,
  placement = "auto-start",
  onOpenChange: _0x5965e0,
  onPromptCommit: _0x548de1
}) {
  const _0x555a6b = {
    promptEl: _0x4cceaf,
    nodeType: _0x431d4a,
    nodeId: _0x19d0aa,
    onGenerate: _0x59ba86,
    explicit: explicit,
    anchorEl: anchorEl,
    placement: placement,
    onOpenChange: _0x5965e0,
    onPromptCommit: _0x548de1
  };
  if (deferPromptTriggerUntilCompositionEnd({
    event: _0xb79d6c,
    promptEl: _0x4cceaf,
    triggerKey: "slash",
    onCompositionEnd: () => checkSlashTrigger({}, _0x555a6b)
  })) {
    return;
  }
  if (shouldSkipPromptTriggerForBulkInput(_0xb79d6c)) {
    closeSlashMenu();
    return;
  }
  let _0x19781c = null;
  let _0x35a4e5 = null;
  if (!explicit) {
    _0x19781c = window.getSelection();
    if (!_0x19781c.rangeCount) {
      return;
    }
    _0x35a4e5 = _0x19781c.getRangeAt(0);
    if (_0x35a4e5.startContainer.nodeType !== Node.TEXT_NODE) {
      closeSlashMenu();
      return;
    }
    const _0xed954 = _0x35a4e5.startContainer.textContent.slice(0, _0x35a4e5.startOffset);
    const _0x203a3f = Math.max(_0xed954.lastIndexOf("/"), _0xed954.lastIndexOf("／"));
    if (_0x203a3f === -1 || _0x203a3f !== _0xed954.length - 1) {
      closeSlashMenu();
      return;
    }
  }
  const _0x396d2d = getSlashPromptPresetEntries(_0x431d4a);
  const _0x4ee4ae = getSlashMenu();
  _cleanupSlashMenuLifecycle();
  document.querySelectorAll(".preset-slash-submenu").forEach(_0x248565 => _0x248565.remove());
  _0x4ee4ae.replaceChildren();
  if (_0x396d2d.length > 0) {
    const _0x250ac5 = document.createElement("div");
    _0x250ac5.className = "preset-slash-header";
    _0x250ac5.textContent = slashMenuText("header");
    _0x4ee4ae.appendChild(_0x250ac5);
  }
  _0x396d2d.forEach((_0x4df85b, _0x23e114) => {
    const _0x8989b0 = document.createElement("div");
    _0x8989b0.className = "preset-slash-item has-desc" + (_0x23e114 === 0 ? " active" : "");
    const _0x48b182 = "slash-item-" + _0x23e114;
    _0x8989b0.dataset.itemId = _0x48b182;
    const _0x3ea46b = document.createElement("div");
    _0x3ea46b.className = "preset-slash-title-wrap";
    const _0x527467 = document.createElement("div");
    _0x527467.className = "preset-slash-title";
    if (_0x4df85b.icon) {
      _appendPresetIcon(_0x527467, _0x4df85b.icon);
    }
    _0x527467.appendChild(document.createTextNode(_0x4df85b.title || ""));
    if (_0x4df85b.subItems) {
      const _0x2c45d5 = document.createElement("span");
      _0x2c45d5.className = "preset-slash-title-arrow";
      _0x2c45d5.textContent = ">";
      _0x527467.appendChild(_0x2c45d5);
    }
    const _0x7f8953 = document.createElement("div");
    _0x7f8953.className = "preset-slash-desc";
    _0x7f8953.textContent = _0x4df85b.desc || _0x4df85b.template || slashMenuText("subItemsDesc");
    _0x3ea46b.appendChild(_0x527467);
    _0x3ea46b.appendChild(_0x7f8953);
    _0x8989b0.appendChild(_0x3ea46b);
    if (_0x4df85b.subItems && _0x4df85b.subItems.length > 0) {
      _0x8989b0.style.overflow = "visible";
      const _0x46d619 = document.createElement("div");
      _0x46d619.className = "preset-slash-submenu";
      _0x46d619.dataset.parentItem = _0x48b182;
      const _0x20ffcc = document.createElement("div");
      _0x20ffcc.className = "preset-slash-submenu-list";
      _0x4df85b.subItems.forEach(_0x125692 => {
        _0x20ffcc.appendChild(_createSlashSubmenuItem({
          submenu: _0x46d619,
          sub: _0x125692,
          promptEl: _0x4cceaf,
          nodeId: _0x19d0aa,
          range: _0x35a4e5,
          selection: _0x19781c,
          onGenerate: _0x59ba86,
          onPromptCommit: _0x548de1
        }));
      });
      _0x46d619.appendChild(_0x20ffcc);
      document.body.appendChild(_0x46d619);
      let _0x4d1352;
      _0x8989b0.addEventListener("mouseenter", () => {
        Array.from(_0x4ee4ae.children).forEach(_0x545c2f => _0x545c2f.classList.remove("active"));
        _0x8989b0.classList.add("active");
        clearTimeout(_0x4d1352);
        _0x46d619.classList.add("open");
        _positionSlashSubmenu(_0x8989b0, _0x46d619);
      });
      _0x8989b0.addEventListener("mouseleave", () => {
        _0x4d1352 = setTimeout(() => {
          _0x46d619.classList.remove("open");
          _hideSlashCoverPreview(_0x46d619);
        }, 100);
      });
      _0x46d619.addEventListener("mouseenter", () => {
        clearTimeout(_0x4d1352);
      });
      _0x46d619.addEventListener("mouseleave", () => {
        _hideSlashCoverPreview(_0x46d619);
        _0x4d1352 = setTimeout(() => {
          _0x46d619.classList.remove("open");
        }, 100);
      });
      _0x8989b0.addEventListener("mousedown", _0x52358a => {
        _0x52358a.preventDefault();
        _0x52358a.stopPropagation();
      });
    } else {
      if (_isSelectableSlashPreset(_0x4df85b)) {
        _0x8989b0.classList.add("has-trigger-badge");
        _appendSlashPresetTriggerBadge(_0x8989b0, _0x4df85b);
      }
      _0x8989b0.addEventListener("mouseenter", () => {
        Array.from(_0x4ee4ae.children).forEach(_0x3037bb => _0x3037bb.classList?.remove("active"));
        _0x8989b0.classList.add("active");
      });
      _0x8989b0.addEventListener("mousedown", _0xe2d122 => {
        _0xe2d122.preventDefault();
        _selectPromptPreset({
          promptEl: _0x4cceaf,
          nodeId: _0x19d0aa,
          preset: _0x4df85b,
          range: _0x35a4e5,
          selection: _0x19781c,
          onGenerate: _0x59ba86,
          onPromptCommit: _0x548de1
        });
      });
    }
    _0x4ee4ae.appendChild(_0x8989b0);
  });
  if (isPromptPresetNodeTypeSupported(_0x431d4a)) {
    const _0x1929a0 = document.createElement("div");
    _0x1929a0.className = "preset-slash-item preset-slash-custom has-desc";
    if (_0x396d2d.length === 0) {
      _0x1929a0.classList.add("preset-slash-custom-first");
    }
    const _0x16612e = document.createElement("div");
    _0x16612e.className = "preset-slash-title-wrap";
    const _0x272e60 = document.createElement("div");
    _0x272e60.className = "preset-slash-title preset-slash-custom-header";
    const _0x509c6e = document.createElement("span");
    _0x509c6e.className = "preset-slash-custom-title";
    _0x509c6e.textContent = slashMenuText("customTitle");
    const _0x2fa744 = document.createElement("span");
    _0x2fa744.className = "preset-slash-badge";
    _0x2fa744.textContent = slashMenuText("customBadge");
    _0x272e60.appendChild(_0x509c6e);
    _0x272e60.appendChild(_0x2fa744);
    const _0x421c7b = document.createElement("div");
    _0x421c7b.className = "preset-slash-desc";
    _0x421c7b.textContent = slashMenuText("customDesc");
    _0x16612e.appendChild(_0x272e60);
    _0x16612e.appendChild(_0x421c7b);
    _0x1929a0.appendChild(_0x16612e);
    _0x1929a0.addEventListener("mousedown", _0x4cc0e6 => {
      _0x4cc0e6.preventDefault();
      closeSlashMenu();
      openCustomPresetsManager({
        nodeType: _0x431d4a,
        sourceNodeId: _0x19d0aa
      });
    });
    _0x4ee4ae.appendChild(_0x1929a0);
  }
  _0x4ee4ae.style.left = "-9999px";
  _0x4ee4ae.style.top = "-9999px";
  _0x4ee4ae.classList.add("open");
  _0x4ee4ae.style.visibility = "hidden";
  _slashPositionState = {
    menu: _0x4ee4ae,
    anchorEl: anchorEl || _0x4cceaf.parentNode || _0x4cceaf,
    placement: placement === "above-end" ? "above-end" : "auto-start",
    menuHeight: _0x4ee4ae.offsetHeight || 280,
    onOpenChange: _0x5965e0
  };
  _positionSlashMenu();
  _watchSlashViewport();
  _bindSlashOutsideDocClick(_0x4ee4ae);
  _0x5965e0?.(true);
}
export function openPromptPresetMenu(_0x3406c0 = {}) {
  return checkSlashTrigger({}, {
    ..._0x3406c0,
    explicit: true
  });
}
function activateSubMenu(_0x1549d6, _0x1a0166) {
  const _0x2b9bff = document.querySelectorAll(".preset-slash-submenu");
  _0x2b9bff.forEach(_0x4f50f2 => {
    if (_0x4f50f2 !== _0x1a0166) {
      _0x4f50f2.classList.remove("open");
    }
  });
  _0x1a0166.classList.add("open");
  _positionSlashSubmenu(_0x1549d6, _0x1a0166);
  const _0x1d4a3e = _getSlashSubmenuPresetItems(_0x1a0166);
  _subMenuState.activeSubmenu = _0x1a0166;
  _subMenuState.parentItem = _0x1549d6;
  _subMenuState.subItems = _0x1d4a3e;
  _subMenuState.subIndex = 0;
  _0x1d4a3e.forEach((_0x5b2e7a, _0x4a6065) => _0x5b2e7a.classList.toggle("active", _0x4a6065 === 0));
  if (_0x1d4a3e[0]) {
    _0x1d4a3e[0].scrollIntoView({
      block: "nearest"
    });
  }
  _showSlashCoverPreviewForItem(_0x1a0166, _0x1d4a3e[0]);
}
function deactivateSubMenu() {
  if (_subMenuState.activeSubmenu) {
    _hideSlashCoverPreview(_subMenuState.activeSubmenu);
    _subMenuState.activeSubmenu.classList.remove("open");
    if (_subMenuState.parentItem) {
      const _0x31dec9 = Array.from(_subMenuState.parentItem.parentNode.children).filter(_0x14de88 => _0x14de88.classList && _0x14de88.classList.contains("preset-slash-item"));
      _0x31dec9.forEach(_0x497208 => _0x497208.classList.remove("active"));
      _subMenuState.parentItem.classList.add("active");
    }
    resetSubMenuState();
  }
}
export function handleSlashKeyboardNavigation(_0x578e87) {
  const _0x4ea15d = getSlashMenu();
  if (!_0x4ea15d.classList.contains("open")) {
    return false;
  }
  if (_subMenuState.activeSubmenu) {
    const {
      subItems: _0x43ac39,
      subIndex: _0x4a3fcf
    } = _subMenuState;
    if (_0x578e87.key === "ArrowLeft") {
      _0x578e87.preventDefault();
      deactivateSubMenu();
      return true;
    }
    if (_0x578e87.key === "ArrowDown") {
      _0x578e87.preventDefault();
      const _0x29309f = _0x4a3fcf < _0x43ac39.length - 1 ? _0x4a3fcf + 1 : 0;
      _subMenuState.subIndex = _0x29309f;
      _0x43ac39.forEach((_0x72879b, _0x44ae10) => _0x72879b.classList.toggle("active", _0x44ae10 === _0x29309f));
      if (_0x43ac39[_0x29309f]) {
        _0x43ac39[_0x29309f].scrollIntoView({
          block: "nearest"
        });
      }
      _showSlashCoverPreviewForItem(_subMenuState.activeSubmenu, _0x43ac39[_0x29309f]);
      return true;
    }
    if (_0x578e87.key === "ArrowUp") {
      _0x578e87.preventDefault();
      const _0x320c4f = _0x4a3fcf > 0 ? _0x4a3fcf - 1 : _0x43ac39.length - 1;
      _subMenuState.subIndex = _0x320c4f;
      _0x43ac39.forEach((_0xcd1ea, _0x38f947) => _0xcd1ea.classList.toggle("active", _0x38f947 === _0x320c4f));
      if (_0x43ac39[_0x320c4f]) {
        _0x43ac39[_0x320c4f].scrollIntoView({
          block: "nearest"
        });
      }
      _showSlashCoverPreviewForItem(_subMenuState.activeSubmenu, _0x43ac39[_0x320c4f]);
      return true;
    }
    if (_0x578e87.key === "Enter") {
      _0x578e87.preventDefault();
      if (_0x4a3fcf >= 0 && _0x43ac39[_0x4a3fcf]) {
        _0x43ac39[_0x4a3fcf].dispatchEvent(new MouseEvent("mousedown"));
      }
      resetSubMenuState();
      return true;
    }
    if (_0x578e87.key === "Escape") {
      _0x578e87.preventDefault();
      deactivateSubMenu();
      return true;
    }
    return false;
  }
  const _0x28dd77 = Array.from(_0x4ea15d.children).filter(_0xe25a7b => _0xe25a7b.classList && _0xe25a7b.classList.contains("preset-slash-item"));
  let _0x267c4a = _0x28dd77.findIndex(_0x1f4007 => _0x1f4007.classList.contains("active"));
  if (_0x578e87.key === "ArrowDown") {
    _0x578e87.preventDefault();
    _0x267c4a = _0x267c4a < _0x28dd77.length - 1 ? _0x267c4a + 1 : 0;
    _0x28dd77.forEach((_0xd893e7, _0x2bad02) => _0xd893e7.classList.toggle("active", _0x2bad02 === _0x267c4a));
    if (_0x28dd77[_0x267c4a]) {
      _0x28dd77[_0x267c4a].scrollIntoView({
        block: "nearest"
      });
    }
    return true;
  }
  if (_0x578e87.key === "ArrowUp") {
    _0x578e87.preventDefault();
    _0x267c4a = _0x267c4a > 0 ? _0x267c4a - 1 : _0x28dd77.length - 1;
    _0x28dd77.forEach((_0x47e452, _0x55c2a0) => _0x47e452.classList.toggle("active", _0x55c2a0 === _0x267c4a));
    if (_0x28dd77[_0x267c4a]) {
      _0x28dd77[_0x267c4a].scrollIntoView({
        block: "nearest"
      });
    }
    return true;
  }
  if (_0x578e87.key === "ArrowRight") {
    _0x578e87.preventDefault();
    if (_0x267c4a >= 0 && _0x28dd77[_0x267c4a]) {
      const _0x3121a1 = document.querySelector(".preset-slash-submenu[data-parent-item=\"" + _0x28dd77[_0x267c4a].dataset.itemId + "\"]");
      if (_0x3121a1) {
        activateSubMenu(_0x28dd77[_0x267c4a], _0x3121a1);
      }
    }
    return true;
  }
  if (_0x578e87.key === "Enter") {
    _0x578e87.preventDefault();
    if (_0x267c4a >= 0) {
      const _0x3e8c5f = document.querySelector(".preset-slash-submenu[data-parent-item=\"" + _0x28dd77[_0x267c4a].dataset.itemId + "\"]");
      if (_0x3e8c5f) {
        activateSubMenu(_0x28dd77[_0x267c4a], _0x3e8c5f);
      } else {
        _0x28dd77[_0x267c4a].dispatchEvent(new MouseEvent("mousedown"));
      }
    }
    return true;
  }
  if (_0x578e87.key === "Escape") {
    _0x578e87.preventDefault();
    closeSlashMenu();
    return true;
  }
  return false;
}