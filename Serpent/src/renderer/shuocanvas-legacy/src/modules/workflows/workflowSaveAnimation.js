function getRect(_0x53fb35) {
  const _0xd80393 = _0x53fb35?.getBoundingClientRect?.();
  if (!_0xd80393) {
    return null;
  }
  const _0x22715e = Number(_0xd80393.left ?? 0);
  const _0x1b85c0 = Number(_0xd80393.top ?? 0);
  const _0x18e988 = Number(_0xd80393.width);
  const _0x589004 = Number(_0xd80393.height);
  const _0x12d401 = Number(_0xd80393.right);
  const _0xb3fe0b = Number(_0xd80393.bottom);
  const _0x444cc9 = Number.isFinite(_0x18e988) && _0x18e988 > 0 ? _0x18e988 : Number.isFinite(_0x12d401) ? _0x12d401 - _0x22715e : 0;
  const _0x580fd7 = Number.isFinite(_0x589004) && _0x589004 > 0 ? _0x589004 : Number.isFinite(_0xb3fe0b) ? _0xb3fe0b - _0x1b85c0 : 0;
  if (!Number.isFinite(_0x22715e) || !Number.isFinite(_0x1b85c0) || !Number.isFinite(_0x444cc9) || !Number.isFinite(_0x580fd7) || _0x444cc9 <= 0 || _0x580fd7 <= 0) {
    return null;
  }
  return {
    left: _0x22715e,
    top: _0x1b85c0,
    width: _0x444cc9,
    height: _0x580fd7,
    right: _0x22715e + _0x444cc9,
    bottom: _0x1b85c0 + _0x580fd7
  };
}
function stripDuplicateIds(_0x2d3a36) {
  if (!_0x2d3a36) {
    return;
  }
  if (_0x2d3a36.id && typeof _0x2d3a36.removeAttribute === "function") {
    _0x2d3a36.removeAttribute("id");
  }
  _0x2d3a36.querySelectorAll?.("[id]")?.forEach(_0x36c625 => {
    _0x36c625.removeAttribute?.("id");
  });
}
export function playWorkflowSaveFly({
  sourceEl: _0x4a5f9c,
  targetEl = null,
  documentRef = globalThis.document,
  windowRef = globalThis.window
} = {}) {
  const _0x4448c7 = documentRef || _0x4a5f9c?.ownerDocument || globalThis.document;
  const _0x3d5ccb = windowRef || globalThis.window;
  if (!_0x4448c7?.body || !_0x4a5f9c || !_0x3d5ccb) {
    return null;
  }
  const _0x359028 = _0x3d5ccb.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
  if (_0x359028) {
    return null;
  }
  const _0x3bf496 = getRect(_0x4a5f9c);
  const _0x347228 = targetEl || _0x4448c7.getElementById?.("btnWorkflows");
  const _0x553874 = getRect(_0x347228);
  if (!_0x3bf496 || !_0x553874) {
    return null;
  }
  const _0x569ac1 = _0x4448c7.createElement("div");
  _0x569ac1.className = "v2-workflow-save-fly";
  _0x569ac1.style.left = _0x3bf496.left + "px";
  _0x569ac1.style.top = _0x3bf496.top + "px";
  _0x569ac1.style.width = _0x3bf496.width + "px";
  _0x569ac1.style.height = _0x3bf496.height + "px";
  const _0x5414e3 = _0x4a5f9c.cloneNode?.(true);
  if (_0x5414e3) {
    stripDuplicateIds(_0x5414e3);
    _0x569ac1.appendChild(_0x5414e3);
  }
  _0x4448c7.body.appendChild(_0x569ac1);
  const _0x57352d = _0x3bf496.left + _0x3bf496.width / 2;
  const _0x12f1bb = _0x3bf496.top + _0x3bf496.height / 2;
  const _0x15cea5 = _0x553874.left + _0x553874.width / 2;
  const _0x324cc7 = _0x553874.top + _0x553874.height / 2;
  const _0x4a37d9 = _0x15cea5 - _0x57352d;
  const _0x49d6bd = _0x324cc7 - _0x12f1bb;
  const _0x457780 = (() => {
    let _0x3a94b6 = false;
    return () => {
      if (_0x3a94b6) {
        return;
      }
      _0x3a94b6 = true;
      _0x569ac1.remove?.();
      _0x347228?.animate?.([{
        transform: "scale(1)",
        filter: "brightness(1)"
      }, {
        transform: "scale(1.08)",
        filter: "brightness(1.2)"
      }, {
        transform: "scale(1)",
        filter: "brightness(1)"
      }], {
        duration: 260,
        easing: "cubic-bezier(0.2, 0, 0, 1)"
      });
    };
  })();
  if (typeof _0x569ac1.animate === "function") {
    const _0xc77111 = _0x569ac1.animate([{
      transform: "translate(0,0) scale(1)",
      opacity: 1
    }, {
      transform: "translate(" + _0x4a37d9 + "px," + _0x49d6bd + "px) scale(0.12)",
      opacity: 0.2
    }], {
      duration: 520,
      easing: "cubic-bezier(0.2, 0, 0, 1)"
    });
    _0xc77111.onfinish = _0x457780;
    _0xc77111.oncancel = _0x457780;
    return {
      fly: _0x569ac1,
      animation: _0xc77111
    };
  }
  _0x3d5ccb.setTimeout?.(_0x457780, 520);
  return {
    fly: _0x569ac1,
    animation: null
  };
}