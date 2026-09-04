const DEFAULT_VIEWPORT_WIDTH = 1024;
const DEFAULT_VIEWPORT_HEIGHT = 768;
const DEFAULT_DURATION_MS = 880;
const DEFAULT_EASING = "cubic-bezier(0.22, 1, 0.36, 1)";
function isReducedMotionPreferred(_0x478e6e) {
  try {
    return _0x478e6e?.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches === true;
  } catch {
    return false;
  }
}
function getViewportSize(_0x57dfcd, _0x296b5b) {
  const _0xa0651e = _0x57dfcd?.documentElement;
  return {
    width: _0x296b5b?.innerWidth || _0xa0651e?.clientWidth || DEFAULT_VIEWPORT_WIDTH,
    height: _0x296b5b?.innerHeight || _0xa0651e?.clientHeight || DEFAULT_VIEWPORT_HEIGHT
  };
}
function resolveRevealPoint({
  documentObject: _0x32e5d6,
  windowObject: _0x13c57f,
  event: _0xc56339,
  sourceElement: _0x4c2080
}) {
  const {
    width: _0x442843,
    height: _0x3887d5
  } = getViewportSize(_0x32e5d6, _0x13c57f);
  const _0x1a0cd0 = {
    x: _0x442843 / 2,
    y: _0x3887d5 / 2
  };
  const _0x344827 = Number(_0xc56339?.clientX);
  const _0x1c6a9d = Number(_0xc56339?.clientY);
  if (Number.isFinite(_0x344827) && Number.isFinite(_0x1c6a9d) && (_0x344827 !== 0 || _0x1c6a9d !== 0)) {
    return {
      x: _0x344827,
      y: _0x1c6a9d
    };
  }
  const _0x5e2d77 = _0x4c2080 || _0xc56339?.currentTarget || _0xc56339?.target;
  if (typeof _0x5e2d77?.getBoundingClientRect !== "function") {
    return _0x1a0cd0;
  }
  const _0x360e16 = _0x5e2d77.getBoundingClientRect();
  return {
    x: _0x360e16.left + _0x360e16.width / 2,
    y: _0x360e16.top + _0x360e16.height / 2
  };
}
function getRevealRadius(_0x72f7e7, _0x562502, _0x403dee, _0x4bec8a) {
  const {
    width: _0x1cfce0,
    height: _0x5edcb6
  } = getViewportSize(_0x72f7e7, _0x562502);
  return Math.ceil(Math.max(Math.hypot(_0x403dee, _0x4bec8a), Math.hypot(_0x1cfce0 - _0x403dee, _0x4bec8a), Math.hypot(_0x403dee, _0x5edcb6 - _0x4bec8a), Math.hypot(_0x1cfce0 - _0x403dee, _0x5edcb6 - _0x4bec8a)));
}
function formatPercentage(_0xc8184a, {
  roundUp = false
} = {}) {
  const _0x432a1b = _0xc8184a * 10000;
  const _0x39592a = (roundUp ? Math.ceil(_0x432a1b) : Math.round(_0x432a1b)) / 10000;
  return String(Object.is(_0x39592a, -0) ? 0 : _0x39592a);
}
function getRelativeRevealGeometry(_0x42bd58, _0x54b955, _0x397395, _0xbcf535) {
  const {
    width: _0x544e17,
    height: _0xf93db2
  } = getViewportSize(_0x42bd58, _0x54b955);
  const _0x18d0ee = Math.hypot(_0x544e17, _0xf93db2) / Math.SQRT2;
  const _0x157e5a = getRevealRadius(_0x42bd58, _0x54b955, _0x397395, _0xbcf535);
  return {
    x: formatPercentage(_0x397395 / _0x544e17 * 100),
    y: formatPercentage(_0xbcf535 / _0xf93db2 * 100),
    radius: formatPercentage(_0x157e5a / _0x18d0ee * 100, {
      roundUp: true
    })
  };
}
export function runCircularRevealTransition({
  event = null,
  sourceElement = null,
  apply: _0x7084f1,
  documentObject = globalThis.document,
  windowObject = globalThis.window,
  rootClassName = "circular-reveal-transitioning",
  duration = DEFAULT_DURATION_MS,
  easing = DEFAULT_EASING
} = {}) {
  if (typeof _0x7084f1 !== "function") {
    return null;
  }
  const _0x100680 = documentObject?.documentElement;
  if (!_0x100680 || isReducedMotionPreferred(windowObject) || typeof documentObject?.startViewTransition !== "function" || typeof _0x100680.animate !== "function") {
    _0x7084f1();
    return null;
  }
  const {
    x: _0x440139,
    y: _0x43e918
  } = resolveRevealPoint({
    documentObject: documentObject,
    windowObject: windowObject,
    event: event,
    sourceElement: sourceElement
  });
  let _0xd82491 = false;
  const _0x8328e2 = () => {
    if (_0xd82491) {
      return undefined;
    }
    _0xd82491 = true;
    return _0x7084f1();
  };
  const _0x6d8cfc = () => _0x100680.classList?.remove(rootClassName);
  _0x100680.classList?.add(rootClassName);
  let _0x5bf16b;
  try {
    _0x5bf16b = documentObject.startViewTransition(_0x8328e2);
  } catch {
    _0x6d8cfc();
    _0x8328e2();
    return null;
  }
  const _0x53ab4c = _0x5bf16b?.ready?.then(() => {
    const _0x4bbce2 = getRelativeRevealGeometry(documentObject, windowObject, _0x440139, _0x43e918);
    const _0x3e9bdd = _0x100680.animate({
      clipPath: ["circle(0px at " + _0x4bbce2.x + "% " + _0x4bbce2.y + "%)", "circle(" + _0x4bbce2.radius + "% at " + _0x4bbce2.x + "% " + _0x4bbce2.y + "%)"]
    }, {
      duration: duration,
      easing: easing,
      pseudoElement: "::view-transition-new(root)"
    });
    return _0x3e9bdd?.finished;
  }).catch(() => {});
  Promise.allSettled([_0x53ab4c, _0x5bf16b?.finished].filter(_0x201146 => _0x201146 && typeof _0x201146.then === "function")).finally(_0x6d8cfc);
  return _0x5bf16b;
}