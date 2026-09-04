export function initializeVideoNodePromptDetailsOnMount(_0x4d937d, {
  sanitizePromptHtml: _0x14f83d
} = {}) {
  if (!_0x4d937d || _0x4d937d._rendererDetailsDeferred === true) {
    return false;
  }
  _0x4d937d._syncPromptBoxSizeFromData(_0x4d937d._data);
  _0x4d937d._setupPromptBoxResize();
  if (_0x4d937d._data?.prompt) {
    _0x4d937d.promptEl.innerHTML = _0x14f83d(_0x4d937d._data.prompt);
    _0x4d937d._initPromptPills();
  }
  _0x4d937d._syncPromptInputVisibility(_0x4d937d._data);
  _0x4d937d._syncGenerationNodeHelpTip();
  _0x4d937d._syncModelProviderProfileControl?.();
  _0x4d937d._syncLocaleTexts();
  return true;
}
export function hydrateDeferredVideoNodeToolbar(_0x266a26, _0x515b3b) {
  const _0x17a784 = _0x266a26?._deferredToolbarEl;
  if (!_0x17a784) {
    return false;
  }
  _0x266a26._deferredToolbarEl = null;
  _0x515b3b?.(_0x17a784, _0x266a26._data);
  return true;
}
export function hydrateVideoNodeDeferredDetails(_0x419b44, _0x1b8dfa = {}) {
  if (!_0x419b44 || _0x419b44._rendererDetailsDeferred !== true) {
    return;
  }
  const {
    readStoreState: _0x486fdb,
    sanitizePromptHtml: _0x42e877
  } = _0x1b8dfa;
  _0x419b44._rendererDetailsDeferred = false;
  _0x419b44._data = _0x486fdb()?.nodes?.[_0x419b44.nodeId] || _0x419b44._data;
  const _0x28518a = _0x419b44._data || {};
  if (_0x419b44.footerEl?.dataset) {
    delete _0x419b44.footerEl.dataset.thinVideoHydration;
  }
  if (_0x419b44.footerEl) {
    _0x419b44._lastFooterSig = "";
    _0x419b44._renderFooter(_0x419b44.footerEl);
  }
  if (_0x419b44.promptEl && document.activeElement !== _0x419b44.promptEl && _0x28518a.prompt !== undefined) {
    const _0x166777 = _0x42e877(_0x28518a.prompt || "");
    if (_0x419b44.promptEl.innerHTML !== _0x166777) {
      _0x419b44.promptEl.innerHTML = _0x166777;
      _0x419b44._initPromptPills();
    }
  }
  _0x419b44._syncPromptInputVisibility(_0x28518a);
  _0x419b44._syncPromptBoxSizeFromData(_0x28518a);
  _0x419b44._setupPromptBoxResize?.();
  _0x419b44._syncGenerationNodeHelpTip();
  _0x419b44._syncModelProviderProfileControl?.();
  _0x419b44._syncLocaleTexts?.();
  _0x419b44._renderRefBarWhenMediaReady();
  _0x419b44._updateSubmitButtonState();
  _0x419b44._syncInitialUpdateSignatures?.(_0x419b44._data || _0x28518a);
  _0x419b44._hydrateDeferredToolbarEvents?.();
  _0x419b44.hydrateRendererThinVideoPresentation?.();
}
export function renderInitialVideoNodeFooter(_0x2cf949, _0xfe6483) {
  if (!_0x2cf949 || !_0xfe6483) {
    return;
  }
  if (_0x2cf949._rendererThinVideoHydration === true) {
    _0xfe6483.dataset.thinVideoHydration = "1";
    _0xfe6483.innerHTML = "";
    _0x2cf949.btnEl = null;
    return;
  }
  if (_0x2cf949._rendererDetailsDeferred === true && typeof _0x2cf949._renderFooterShell === "function") {
    _0x2cf949._renderFooterShell(_0xfe6483);
    return;
  }
  _0x2cf949._renderFooter(_0xfe6483);
}