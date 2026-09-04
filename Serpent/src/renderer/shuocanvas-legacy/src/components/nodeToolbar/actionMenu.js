import { positionAnchoredSubmenu } from "../../utils/submenuPosition.js";
function resolveCanvasViewportTop(_0x3fcba7, _0x1dd732 = globalThis.document) {
  const _0x549beb = Number(_0x3fcba7);
  if (Number.isFinite(_0x549beb)) {
    return Math.max(0, _0x549beb);
  }
  const _0x3d6ac1 = _0x1dd732?.querySelector?.(".v2-canvas-stage")?.getBoundingClientRect?.();
  if (Number.isFinite(Number(_0x3d6ac1?.top))) {
    return Math.max(0, Number(_0x3d6ac1.top));
  } else {
    return 0;
  }
}
export function appendToolbarActionMenuTitle(_0xb0cb5c, _0x4cb938) {
  const _0x15569e = document.createElement("div");
  _0x15569e.className = "node-toolbar-action-menu-title";
  _0x15569e.textContent = _0x4cb938;
  _0xb0cb5c.appendChild(_0x15569e);
  return _0x15569e;
}
export function createToolbarActionMenuItem(_0x412b01 = "") {
  const _0x3d4ba0 = document.createElement("div");
  _0x3d4ba0.className = ["node-toolbar-action-menu-item", _0x412b01].filter(Boolean).join(" ");
  return _0x3d4ba0;
}
export function createToolbarActionMenuIcon() {
  const _0x280d2e = document.createElement("div");
  _0x280d2e.className = "node-toolbar-action-menu-icon";
  return _0x280d2e;
}
export function createRunningHubActionIcon() {
  const _0x286942 = createToolbarActionMenuIcon();
  const _0x91c6d5 = document.createElement("img");
  _0x91c6d5.className = "node-toolbar-action-provider-logo";
  _0x91c6d5.src = "images/RH.png";
  _0x91c6d5.alt = "runninghub";
  _0x286942.appendChild(_0x91c6d5);
  return _0x286942;
}
export function createToolbarActionMenuBody() {
  const _0x1f4c82 = document.createElement("div");
  _0x1f4c82.className = "node-toolbar-action-menu-body";
  return _0x1f4c82;
}
export function createToolbarActionTitleRow() {
  const _0x22b081 = document.createElement("div");
  _0x22b081.className = "node-toolbar-action-title-row";
  return _0x22b081;
}
export function createToolbarActionTitle(_0x43b792) {
  const _0x3e9e52 = document.createElement("span");
  _0x3e9e52.className = "node-toolbar-action-menu-item-title";
  _0x3e9e52.textContent = _0x43b792;
  return _0x3e9e52;
}
export function createToolbarActionDescription(_0x41e111) {
  const _0x382980 = document.createElement("span");
  _0x382980.className = "node-toolbar-action-menu-item-desc";
  _0x382980.textContent = _0x41e111;
  return _0x382980;
}
export function createToolbarActionVipBadge(_0x4bf2b7 = "VIP") {
  const _0x17c6bb = document.createElement("span");
  _0x17c6bb.className = "node-toolbar-action-vip-badge";
  _0x17c6bb.textContent = _0x4bf2b7;
  return _0x17c6bb;
}
export function createToolbarActionPopupAnchorPositionGetter(_0x2c4335, _0x8ae829 = {}) {
  const _0x13b386 = Number.isFinite(Number(_0x8ae829.gap)) ? Number(_0x8ae829.gap) : 12;
  const _0x4b4c34 = _0x43b3d9 => {
    const _0x5e983a = _0x43b3d9?.getBoundingClientRect?.();
    if (!_0x5e983a) {
      return null;
    }
    const _0x3b3522 = Number(_0x5e983a.width) || 0;
    const _0x75523 = Number(_0x5e983a.height) || 0;
    return {
      left: Number(_0x5e983a.left) || 0,
      top: Number(_0x5e983a.top) || 0,
      width: _0x3b3522,
      height: _0x75523,
      right: Number(_0x5e983a.right) || (Number(_0x5e983a.left) || 0) + _0x3b3522,
      bottom: Number(_0x5e983a.bottom) || (Number(_0x5e983a.top) || 0) + _0x75523
    };
  };
  const _0x241671 = _0x974960 => Boolean(_0x974960 && _0x974960.width > 0 && _0x974960.height > 0);
  const _0x16cb7b = () => _0x4b4c34(_0x2c4335?.closest?.(".v2-img-toolbar-more-menu"));
  const _0x1040cf = () => _0x4b4c34(_0x2c4335);
  const _0x54449f = () => {
    const _0x108054 = _0x1040cf() || {
      left: 0,
      top: 0,
      width: 0,
      height: 0
    };
    const _0xd562b = _0x16cb7b();
    return {
      left: _0x108054.left + _0x108054.width / 2,
      top: (_0x241671(_0xd562b) ? _0xd562b.top : _0x108054.top) - _0x13b386
    };
  };
  _0x54449f.hasVisibleAnchor = () => _0x241671(_0x1040cf());
  return _0x54449f;
}
export function positionToolbarActionSubmenu(_0x474476, _0x25190e, {
  gap = 12,
  viewportInset = 8,
  viewportTop: _0x12c5e5,
  windowObject = globalThis.window
} = {}) {
  const _0x303b2c = _0x474476?.getBoundingClientRect?.();
  if (!_0x303b2c || _0x303b2c.width <= 0 || _0x303b2c.height <= 0) {
    return null;
  }
  _0x25190e.style.transform = "translate(0, 0)";
  return positionAnchoredSubmenu({
    submenu: _0x25190e,
    anchorRect: _0x303b2c,
    preferredSide: "right",
    position: "fixed",
    gap: gap,
    viewportMargin: viewportInset,
    viewportWidth: windowObject?.innerWidth,
    viewportHeight: windowObject?.innerHeight,
    viewportTop: resolveCanvasViewportTop(_0x12c5e5)
  });
}
export function positionToolbarActionSubmenuAbove(_0x4ee4f0, _0x3d45a7, {
  viewportInset = 8,
  viewportTop: _0x55c2b1,
  windowObject = globalThis.window
} = {}) {
  const _0x447a3d = Number(_0x4ee4f0?.left) || 0;
  const _0x5585b4 = Number(_0x4ee4f0?.top) || 0;
  _0x3d45a7.style.transform = "translate(0, 0)";
  return positionAnchoredSubmenu({
    submenu: _0x3d45a7,
    anchorRect: {
      left: _0x447a3d,
      right: _0x447a3d,
      top: _0x5585b4,
      bottom: _0x5585b4,
      width: 0,
      height: 0
    },
    horizontalPlacement: "center",
    verticalPlacement: "above",
    position: "fixed",
    viewportMargin: viewportInset,
    viewportWidth: windowObject?.innerWidth,
    viewportHeight: windowObject?.innerHeight,
    viewportTop: resolveCanvasViewportTop(_0x55c2b1)
  });
}