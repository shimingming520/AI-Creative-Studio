export function renderStoryGenerationSpinner({
  button = false
} = {}) {
  return "<span class=\"storyboard-script-loading-spinner" + (button ? " story-action-button-spinner" : "") + "\" aria-hidden=\"true\"></span>";
}
export function syncStoryAsyncButton(_0x506f8f, _0x5a5cbf, {
  spinnerOnly = false
} = {}) {
  if (!_0x506f8f) {
    return false;
  }
  const _0x252d67 = _0x5a5cbf === true;
  _0x506f8f.setAttribute?.("aria-busy", String(_0x252d67));
  _0x506f8f.classList?.toggle?.("is-story-spinner-only", _0x252d67 && spinnerOnly);
  const _0x547e0d = _0x506f8f.querySelector?.(".story-action-button-spinner");
  if (_0x252d67 && !_0x547e0d) {
    _0x506f8f.insertAdjacentHTML?.("afterbegin", renderStoryGenerationSpinner({
      button: true
    }));
  } else if (!_0x252d67) {
    _0x547e0d?.remove?.();
  }
  return _0x252d67;
}