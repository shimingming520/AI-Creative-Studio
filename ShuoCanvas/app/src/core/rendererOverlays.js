import { t } from "../i18n/index.js";
export function createPickConnectBannerEl() {
  const _0x3006a0 = document.createElement("div");
  _0x3006a0.id = "v2-pick-connect-banner";
  _0x3006a0.className = "v2-pick-connect-banner";
  _0x3006a0.textContent = t("coreUi.rendererOverlays.pickConnectBanner");
  Object.assign(_0x3006a0.style, {
    position: "fixed",
    top: "calc(var(--header-h, 56px) + var(--space-14))",
    left: "50%",
    transform: "translateX(-50%)",
    background: "var(--preset-menu-bg)",
    border: "1px solid var(--preset-menu-border)",
    borderRadius: "var(--radius-18)",
    padding: "10px 20px",
    color: "var(--text-primary)",
    fontSize: "14px",
    fontWeight: "500",
    boxShadow: "var(--preset-menu-shadow)",
    backdropFilter: "blur(var(--preset-menu-blur))",
    zIndex: "2000",
    display: "none",
    pointerEvents: "none"
  });
  return _0x3006a0;
}
export function renderPickConnectBanner(_0x3c3969, _0x28c4c5) {
  _0x3c3969.style.display = _0x28c4c5?.active ? "block" : "none";
}