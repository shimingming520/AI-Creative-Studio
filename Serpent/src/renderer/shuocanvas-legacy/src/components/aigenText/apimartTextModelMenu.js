import { getModelsByKind } from "../../manifests/index.js";
import { getTextProviderMenuGroups } from "../../manifests/text/textProviderMenuGroups.js";
import { renderNodeMenuGroup } from "../shared/nodeModelMenu.js";
import { buildModelProviderProfileBadgesHtml } from "../shared/modelProviderProfileControl.js";
const TEXT_MODEL_NAME_COLLATOR = new Intl.Collator("zh-CN", {
  numeric: true,
  sensitivity: "base"
});
function escapeHtml(_0x3d506b) {
  return String(_0x3d506b ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}
function getTextMenuMeta(_0x48439c) {
  const _0x281e6a = _0x48439c?.extensions?.textMenu;
  if (_0x281e6a && typeof _0x281e6a === "object") {
    return _0x281e6a;
  } else {
    return null;
  }
}
function getTextMenuBadge(_0x4be2f9) {
  const _0x4f50fb = String(_0x4be2f9?.badge || "").trim();
  return _0x4f50fb || "";
}
function getTextModelMenuTitle(_0x455fde) {
  const _0x4c32a1 = getTextMenuMeta(_0x455fde);
  return String(_0x4c32a1?.title || _0x455fde?.displayName || _0x455fde?.modelId || "").trim();
}
function compareTextModelMenuItemsByName(_0x6f53cf, _0x549f38) {
  const _0x678f3b = TEXT_MODEL_NAME_COLLATOR.compare(getTextModelMenuTitle(_0x6f53cf), getTextModelMenuTitle(_0x549f38));
  if (_0x678f3b !== 0) {
    return _0x678f3b;
  }
  return TEXT_MODEL_NAME_COLLATOR.compare(String(_0x6f53cf?.modelId || ""), String(_0x549f38?.modelId || ""));
}
function getCustomProviderMeta(_0x499c28) {
  const _0x178f5f = _0x499c28?.extensions?.customProvider;
  if (_0x178f5f && typeof _0x178f5f === "object") {
    return _0x178f5f;
  } else {
    return null;
  }
}
function getCustomTextProviderMenuGroups() {
  const _0x48b6be = new Map();
  getModelsByKind("text").forEach(_0xbd4e7 => {
    const _0x730848 = getTextMenuMeta(_0xbd4e7);
    const _0x12a282 = getCustomProviderMeta(_0xbd4e7);
    const _0x557850 = String(_0x730848?.group || _0xbd4e7?.provider || "").trim();
    if (!_0x557850 || !_0x12a282 || _0x48b6be.has(_0x557850)) {
      return;
    }
    _0x48b6be.set(_0x557850, {
      id: _0x557850,
      label: _0x12a282.displayName || _0x557850,
      subtitle: _0x730848?.subtitle || "自定义中转站",
      icon: _0x730848?.icon || "oa",
      customProvider: true
    });
  });
  return Array.from(_0x48b6be.values());
}
function resolveTextIcon(_0x27cc67) {
  const _0x35aadd = getTextMenuMeta(_0x27cc67);
  if (_0x35aadd?.icon) {
    return _0x35aadd.icon;
  }
  const _0x241b9f = String(_0x27cc67?.modelId || "").toLowerCase();
  if (_0x241b9f.includes("deepseek")) {
    return "deepseek";
  }
  if (_0x241b9f.includes("gpt")) {
    return "oa";
  }
  if (_0x241b9f.includes("gemini")) {
    return "gemini";
  }
  if (_0x241b9f.includes("qwen")) {
    return "qwen";
  }
  if (_0x241b9f.includes("kimi")) {
    return "moonshot";
  }
  const _0x3c8ede = String(_0x27cc67?.provider || "").toLowerCase();
  if (_0x3c8ede === "runninghub") {
    return "gemini";
  }
  if (_0x3c8ede === "grsai") {
    return "grsai";
  }
  if (_0x3c8ede === "ppio") {
    return "ppio";
  }
  if (_0x3c8ede === "apimart") {
    return "am";
  } else {
    return _0x3c8ede || "am";
  }
}
export function getTextModelMenuItems(_0x17b908) {
  const _0x4179e0 = String(_0x17b908 || "").trim().toLowerCase();
  return getModelsByKind("text").filter(_0x293153 => String(_0x293153?.provider || "").toLowerCase() === _0x4179e0 && getTextMenuMeta(_0x293153)?.group === _0x4179e0).sort(compareTextModelMenuItemsByName).map(_0xc20ef7 => {
    const _0x42b5d0 = getTextMenuMeta(_0xc20ef7) || {};
    return Object.freeze({
      modelId: _0xc20ef7.modelId,
      provider: _0xc20ef7.provider,
      title: getTextModelMenuTitle(_0xc20ef7),
      subtitle: _0x42b5d0.subtitle || _0xc20ef7.description || "",
      icon: resolveTextIcon(_0xc20ef7),
      badge: getTextMenuBadge(_0x42b5d0)
    });
  });
}
export const TEXT_MODEL_MENU_ITEMS_BY_PROVIDER = Object.freeze({
  grsai: Object.freeze(getTextModelMenuItems("grsai")),
  ppio: Object.freeze(getTextModelMenuItems("ppio")),
  apimart: Object.freeze(getTextModelMenuItems("apimart")),
  agnes: Object.freeze(getTextModelMenuItems("agnes")),
  runninghub: Object.freeze(getTextModelMenuItems("runninghub")),
  volcengine: Object.freeze(getTextModelMenuItems("volcengine"))
});
export const TEXT_MODEL_IDS_BY_PROVIDER = Object.freeze(Object.fromEntries(Object.entries(TEXT_MODEL_MENU_ITEMS_BY_PROVIDER).map(([_0x1b25c1, _0x190e7a]) => [_0x1b25c1, Object.freeze(_0x190e7a.map(_0x3344fd => _0x3344fd.modelId))])));
export const TEXT_MODEL_DISPLAY_NAME_MAP = Object.freeze(Object.fromEntries(Object.values(TEXT_MODEL_MENU_ITEMS_BY_PROVIDER).flat().map(_0x5306dc => [_0x5306dc.modelId, _0x5306dc.title])));
export const APIMART_TEXT_MODEL_MENU_ITEMS = Object.freeze(TEXT_MODEL_MENU_ITEMS_BY_PROVIDER.apimart);
export const APIMART_TEXT_MODEL_IDS = Object.freeze(TEXT_MODEL_IDS_BY_PROVIDER.apimart);
export const APIMART_TEXT_MODEL_DISPLAY_NAME_MAP = Object.freeze(Object.fromEntries(APIMART_TEXT_MODEL_MENU_ITEMS.map(_0x14553e => [_0x14553e.modelId, _0x14553e.title])));
export const RUNNINGHUB_TEXT_MODEL_MENU_ITEMS = Object.freeze(TEXT_MODEL_MENU_ITEMS_BY_PROVIDER.runninghub);
export const RUNNINGHUB_TEXT_MODEL_IDS = Object.freeze(TEXT_MODEL_IDS_BY_PROVIDER.runninghub);
export const VOLCENGINE_TEXT_MODEL_MENU_ITEMS = Object.freeze(TEXT_MODEL_MENU_ITEMS_BY_PROVIDER.volcengine);
export const VOLCENGINE_TEXT_MODEL_IDS = Object.freeze(TEXT_MODEL_IDS_BY_PROVIDER.volcengine);
export function findTextModelMenuItem(_0x3cc1c6) {
  const _0x4457e2 = String(_0x3cc1c6 || "").trim();
  return getModelsByKind("text").map(_0x5bbcb9 => {
    const _0x5eb473 = getTextMenuMeta(_0x5bbcb9) || {};
    return {
      modelId: _0x5bbcb9.modelId,
      provider: _0x5bbcb9.provider,
      title: _0x5eb473.title || _0x5bbcb9.displayName,
      subtitle: _0x5eb473.subtitle || _0x5bbcb9.description || "",
      icon: resolveTextIcon(_0x5bbcb9),
      badge: getTextMenuBadge(_0x5eb473)
    };
  }).find(_0x1b88a6 => _0x1b88a6.modelId === _0x4457e2) || null;
}
export function buildTextModelIconHTML(_0x944a15, _0x41b74d = 20) {
  const _0x59d25f = Math.max(10, Number(_0x41b74d) || 20);
  const _0x5b77d4 = _0x59d25f <= 12 ? "text-model-icon-small" : "text-model-icon";
  if (_0x944a15 === "deepseek") {
    return "<img src=\"images/deepseek.svg\" class=\"" + _0x5b77d4 + "\" alt=\"deepseek\">";
  }
  if (_0x944a15 === "gemini") {
    return "<img src=\"images/gemini.svg\" class=\"" + _0x5b77d4 + "\" alt=\"gemini\">";
  }
  if (_0x944a15 === "qwen") {
    return "<img src=\"images/qwen.svg\" class=\"" + _0x5b77d4 + "\" alt=\"qwen\">";
  }
  if (_0x944a15 === "grsai") {
    return "<img src=\"images/grsai.png\" class=\"" + _0x5b77d4 + " text-model-icon-padded\" alt=\"grsai\">";
  }
  if (_0x944a15 === "ppio") {
    return "<img src=\"images/ppio.png\" class=\"" + _0x5b77d4 + "\" alt=\"ppio\">";
  }
  if (_0x944a15 === "runninghub") {
    return "<img src=\"images/RH.png\" class=\"" + _0x5b77d4 + "\" alt=\"runninghub\">";
  }
  if (_0x944a15 === "volcengine") {
    return "<img src=\"images/volcengine.svg\" class=\"" + _0x5b77d4 + "\" alt=\"volcengine\">";
  }
  if (_0x944a15 === "agnes") {
    return "<div class=\"" + _0x5b77d4 + " text-model-icon-badge\">AG</div>";
  }
  if (_0x944a15 === "moonshot") {
    return "<div class=\"" + _0x5b77d4 + " text-model-icon-badge text-model-icon-moonshot\"><span>M</span></div>";
  }
  if (_0x944a15 === "am") {
    return "<div class=\"" + _0x5b77d4 + " text-model-icon-badge text-model-icon-apimart\">AM</div>";
  }
  const _0x2b7433 = _0x944a15 === "oa" ? "OA" : "AM";
  return "<div class=\"" + _0x5b77d4 + " text-model-icon-badge\">" + _0x2b7433 + "</div>";
}
export function buildTextModelSmallIconHTML(_0x589fb0) {
  const _0xd8c77e = findTextModelMenuItem(_0x589fb0);
  if (_0xd8c77e) {
    return buildTextModelIconHTML(_0xd8c77e.icon, 12);
  } else {
    return "";
  }
}
export function buildTextModelMenuHTML(_0x1e89b7, _0x37f9f0, _0x489c56 = {}) {
  const _0x2e3f6a = Array.isArray(_0x489c56.allowedModelIds) ? new Set(_0x489c56.allowedModelIds.map(_0x4e5664 => String(_0x4e5664 || "").trim())) : null;
  const _0x476897 = getTextModelMenuItems(_0x37f9f0).filter(_0x3d6dbf => !_0x2e3f6a || _0x2e3f6a.has(_0x3d6dbf.modelId));
  return _0x476897.map(({
    modelId: _0x4b1f8e,
    provider: _0x17da20,
    title: _0x2a170b,
    subtitle: _0x540501,
    icon: _0x5c9e84,
    badge: _0x570915
  }) => "\n                  <div class=\"floating-menu-item node-menu-item " + (_0x1e89b7 === _0x4b1f8e ? "active" : "") + "\" data-value=\"" + escapeHtml(_0x4b1f8e) + "\" data-provider=\"" + escapeHtml(_0x17da20) + "\">\n                    " + buildTextModelIconHTML(_0x5c9e84, 20) + "\n                    <div class=\"fmi-content\">\n                      <div class=\"fmi-title\">" + escapeHtml(_0x2a170b) + (_0x570915 ? " <span class=\"floating-menu-badge floating-menu-badge-warning floating-menu-badge-inline\">" + escapeHtml(_0x570915) + "</span>" : "") + "</div>\n                      <div class=\"fmi-sub\">" + escapeHtml(_0x540501) + "</div>\n                    </div>\n                    " + buildModelProviderProfileBadgesHtml(_0x4b1f8e) + "\n                  </div>").join("");
}
export function buildTextProviderMenuGroupsHTML(_0xcc6cc1, _0x8b346a = {}) {
  const _0x1ae80c = Array.isArray(_0x8b346a.providers) ? new Set(_0x8b346a.providers.map(_0xef89d3 => String(_0xef89d3).toLowerCase())) : null;
  const _0x3b3040 = [...getTextProviderMenuGroups(), ...getCustomTextProviderMenuGroups()];
  return _0x3b3040.filter(_0x2ff24b => !_0x1ae80c || _0x1ae80c.has(_0x2ff24b.id) || _0x1ae80c.has(_0x2ff24b.providerId)).map(_0x101a51 => {
    const _0x25c24e = buildTextModelMenuHTML(_0xcc6cc1, _0x101a51.providerId || _0x101a51.id, _0x8b346a);
    if (!_0x25c24e.trim()) {
      return "";
    }
    return renderNodeMenuGroup({
      id: _0x101a51.id,
      headerClass: _0x101a51.id + "-group-header",
      submenuClass: _0x101a51.id + "-submenu",
      toggleAttr: "data-" + _0x101a51.id + "-toggle",
      label: _0x101a51.label,
      subtitle: _0x101a51.subtitle,
      developerOnly: _0x101a51.developerOnly === true,
      iconHtml: _0x101a51.icon === "runninghub" ? "<img src=\"images/RH.png\" class=\"text-model-icon\" alt=\"runninghub\">" : buildTextModelIconHTML(_0x101a51.icon, 20),
      itemsHtml: _0x25c24e
    }, {
      activeModel: _0xcc6cc1
    });
  }).join("");
}
export function buildApimartTextModelMenuHTML(_0x551695) {
  return buildTextModelMenuHTML(_0x551695, "apimart");
}
export function buildRunningHubTextModelMenuHTML(_0xd119c5) {
  return buildTextModelMenuHTML(_0xd119c5, "runninghub");
}