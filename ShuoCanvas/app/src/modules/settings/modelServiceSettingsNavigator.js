import { onLocaleChange, t } from "../../i18n/index.js";
export const MODEL_SERVICE_CATEGORY_IDS = Object.freeze(["all", "text", "image", "video", "audio"]);
const MODEL_SERVICE_CATEGORY_SET = new Set(MODEL_SERVICE_CATEGORY_IDS);
const PROVIDER_STATUS_TONES = Object.freeze(["testing", "success", "partial", "configured", "unconfigured", "deprecated", "danger"]);
const PROVIDER_STATUS_CLASSES = PROVIDER_STATUS_TONES.map(_0x32e001 => "settings-provider-status--" + _0x32e001);
let activeNavigator = null;
export function normalizeModelServiceKinds(_0x377f46) {
  const _0x53d2e1 = Array.isArray(_0x377f46) ? _0x377f46 : String(_0x377f46 || "").split(/[\s,]+/);
  return Array.from(new Set(_0x53d2e1.map(_0x315331 => String(_0x315331 || "").trim().toLowerCase()).filter(_0x181850 => MODEL_SERVICE_CATEGORY_SET.has(_0x181850) && _0x181850 !== "all")));
}
export function modelServiceKindsMatchCategory(_0x5f1034, _0x274c88 = "all") {
  const _0x5d0847 = String(_0x274c88 || "all").trim().toLowerCase();
  if (_0x5d0847 === "all") {
    return true;
  }
  return normalizeModelServiceKinds(_0x5f1034).includes(_0x5d0847);
}
export function aggregateModelServiceProviderStatus(_0x4522ab = []) {
  const _0x388341 = _0x4522ab.map(_0x2c7da1 => ({
    text: String(_0x2c7da1?.text || "").trim(),
    tone: String(_0x2c7da1?.tone || "").trim().toLowerCase()
  })).filter(_0x418d64 => _0x418d64.text || _0x418d64.tone);
  if (!_0x388341.length) {
    return {
      text: t("settings.apiInput.readiness.requiredShort"),
      tone: "unconfigured"
    };
  }
  if (_0x388341.length === 1) {
    return _0x388341[0];
  }
  const _0xbd5dfe = _0x388341.filter(_0x57a137 => _0x57a137.tone === "success").length;
  if (_0xbd5dfe === _0x388341.length) {
    return {
      text: t("settings.apiInput.catalog.allRoutesReady"),
      tone: "success"
    };
  }
  if (_0xbd5dfe > 0) {
    return {
      text: t("settings.apiInput.catalog.routesReady", {
        count: _0xbd5dfe,
        total: _0x388341.length
      }),
      tone: "partial"
    };
  }
  const _0x167d01 = ["testing", "partial", "configured", "danger", "deprecated", "unconfigured"];
  const _0x3dfb4b = _0x167d01.find(_0x44804b => _0x388341.some(_0x7ab897 => _0x7ab897.tone === _0x44804b)) || _0x388341[0].tone;
  return _0x388341.find(_0x493307 => _0x493307.tone === _0x3dfb4b) || _0x388341[0];
}
function readProviderStatusTone(_0x3361e6) {
  return PROVIDER_STATUS_TONES.find(_0x4f991c => _0x3361e6?.classList?.contains("settings-provider-status--" + _0x4f991c)) || "";
}
function readCardStatus(_0x34eb60) {
  const _0x107b77 = Array.from(_0x34eb60?.querySelectorAll?.(".settings-provider-status") || []).find(_0x4d74eb => !_0x4d74eb.hidden && String(_0x4d74eb.textContent || "").trim());
  if (!_0x107b77) {
    return null;
  }
  return {
    text: String(_0x107b77.textContent || "").trim(),
    tone: readProviderStatusTone(_0x107b77)
  };
}
function getProviderLabel(_0x33de5a, _0x35e1f6) {
  return String(_0x35e1f6?.querySelector?.(".settings-card-title")?.textContent || "").trim() || _0x33de5a;
}
function cloneProviderIcon(_0x889cbf, _0x3971f4) {
  const _0x557236 = _0x3971f4?.querySelector?.(".settings-card-head");
  const _0x49bdbf = _0x557236?.querySelector?.(".settings-card-icon, .settings-card-badge, svg");
  const _0x43c943 = _0x889cbf.createElement("span");
  _0x43c943.className = "model-service-provider-option-icon";
  _0x43c943.setAttribute("aria-hidden", "true");
  if (_0x49bdbf?.cloneNode) {
    const _0x3d8f95 = _0x49bdbf.cloneNode(true);
    _0x3d8f95.removeAttribute?.("id");
    _0x43c943.appendChild(_0x3d8f95);
  }
  return _0x43c943;
}
function getRouteLabel(_0x33718e, _0x357404) {
  const _0x5f1abd = String(_0x357404?.dataset?.modelServiceRouteLabelI18n || "").trim();
  if (_0x5f1abd) {
    return t(_0x5f1abd);
  }
  if (_0x33718e === "domestic") {
    return t("settings.apiInput.catalog.routeDomestic");
  }
  if (_0x33718e === "international") {
    return t("settings.apiInput.catalog.routeInternational");
  }
  return String(_0x357404?.querySelector?.(".settings-card-title")?.textContent || "").trim() || _0x33718e;
}
function isCardAvailable(_0x20fed4, _0x482752) {
  if (!_0x20fed4 || _0x20fed4.hidden) {
    return false;
  }
  if (_0x20fed4.classList?.contains("dev-mode-only") && !_0x482752?.body?.classList?.contains("dev-mode")) {
    return false;
  }
  return true;
}
function createProviderGroup(_0x4aa117, _0x1c0868, _0x227613, _0x4370ce) {
  const _0x33b631 = _0x4aa117.createElement("section");
  _0x33b631.className = "model-service-provider-detail";
  _0x33b631.dataset.modelServiceProviderDetail = _0x1c0868;
  _0x33b631.hidden = true;
  const _0x2012b2 = new Map();
  if (_0x227613.length > 1) {
    const _0x4b7c70 = _0x4aa117.createElement("div");
    _0x4b7c70.className = "model-service-detail-route-header";
    const _0x14dcd7 = _0x4aa117.createElement("span");
    _0x14dcd7.className = "model-service-detail-route-label";
    _0x14dcd7.dataset.i18n = "settings.apiInput.catalog.routeLabel";
    _0x14dcd7.textContent = t("settings.apiInput.catalog.routeLabel");
    const _0x5ec1b5 = _0x4aa117.createElement("div");
    _0x5ec1b5.className = "model-service-detail-route-tabs";
    _0x5ec1b5.setAttribute("role", "tablist");
    _0x5ec1b5.setAttribute("aria-label", t("settings.apiInput.catalog.routeAria"));
    _0x227613.forEach((_0x20c25c, _0x32cd6d) => {
      const _0x6ec6ca = String(_0x20c25c.dataset.modelServiceRoute || "").trim() || "route-" + (_0x32cd6d + 1);
      const _0x26329b = _0x4aa117.createElement("button");
      _0x26329b.type = "button";
      _0x26329b.className = "model-service-detail-route-tab";
      _0x26329b.dataset.modelServiceRouteTarget = _0x6ec6ca;
      _0x26329b.setAttribute("role", "tab");
      _0x26329b.setAttribute("aria-selected", "false");
      const _0x27c5d6 = _0x20c25c.id || "model-service-route-panel-" + _0x1c0868 + "-" + _0x6ec6ca;
      const _0x184f37 = _0x27c5d6 + "-tab";
      _0x20c25c.id = _0x27c5d6;
      _0x26329b.id = _0x184f37;
      _0x26329b.setAttribute("aria-controls", _0x27c5d6);
      _0x20c25c.setAttribute("role", "tabpanel");
      _0x20c25c.setAttribute("aria-labelledby", _0x184f37);
      const _0x552933 = _0x4aa117.createElement("span");
      _0x552933.className = "model-service-detail-route-name";
      _0x552933.textContent = getRouteLabel(_0x6ec6ca, _0x20c25c);
      const _0x414cd3 = _0x4aa117.createElement("span");
      _0x414cd3.className = "settings-provider-status model-service-detail-route-status settings-provider-status--unconfigured";
      _0x414cd3.textContent = t("settings.apiInput.readiness.requiredShort");
      _0x26329b.append(_0x552933, _0x414cd3);
      _0x5ec1b5.appendChild(_0x26329b);
      _0x2012b2.set(_0x6ec6ca, {
        button: _0x26329b,
        card: _0x20c25c,
        name: _0x552933,
        status: _0x414cd3
      });
    });
    _0x4b7c70.append(_0x14dcd7, _0x5ec1b5);
    _0x33b631.appendChild(_0x4b7c70);
  }
  const _0x4aa52b = _0x4aa117.createElement("div");
  _0x4aa52b.className = "model-service-provider-card-stage";
  _0x227613.forEach(_0x826012 => {
    _0x826012.classList.add("model-service-provider-card");
    _0x4aa52b.appendChild(_0x826012);
  });
  _0x33b631.appendChild(_0x4aa52b);
  _0x4370ce.appendChild(_0x33b631);
  return {
    id: _0x1c0868,
    cards: _0x227613,
    kinds: Array.from(new Set(_0x227613.flatMap(_0x3170c1 => normalizeModelServiceKinds(_0x3170c1.dataset.modelServiceKinds)))),
    wrapper: _0x33b631,
    routeButtons: _0x2012b2,
    activeRouteId: "",
    button: null,
    buttonName: null
  };
}
function createProviderButton(_0x2ff452, _0x2553d9, _0x53f28b) {
  const _0x439ef0 = _0x2553d9.cards[0];
  const _0x2cb705 = _0x2ff452.createElement("button");
  _0x2cb705.type = "button";
  _0x2cb705.className = "model-service-provider-option";
  _0x2cb705.dataset.modelServiceProviderTarget = _0x2553d9.id;
  _0x2cb705.setAttribute("aria-pressed", "false");
  if (_0x439ef0.classList?.contains("dev-mode-only")) {
    _0x2cb705.classList.add("dev-mode-only");
  }
  const _0x4706ee = _0x2ff452.createElement("span");
  _0x4706ee.className = "model-service-provider-option-name";
  _0x4706ee.textContent = getProviderLabel(_0x2553d9.id, _0x439ef0);
  _0x2cb705.append(cloneProviderIcon(_0x2ff452, _0x439ef0), _0x4706ee);
  _0x53f28b.appendChild(_0x2cb705);
  _0x2553d9.button = _0x2cb705;
  _0x2553d9.buttonName = _0x4706ee;
}
function createNavigatorController({
  documentObject: _0x36075c,
  browserEl: _0x36bc95,
  pickerEl: _0x5186f2,
  detailsEl: _0x18992a,
  groups: _0x5354bd
}) {
  let _0x526487 = "all";
  let _0x39c8bd = "";
  const _0x354ac4 = [];
  const _0x56adeb = _0x2ebc6d => _0x2ebc6d.cards.filter(_0x256643 => isCardAvailable(_0x256643, _0x36075c));
  const _0x4ecb7b = (_0x39b22b, _0x2a96d0) => {
    if (!_0x39b22b) {
      return;
    }
    _0x39b22b.textContent = _0x2a96d0?.text || t("settings.apiInput.readiness.requiredShort");
    _0x39b22b.classList.remove(...PROVIDER_STATUS_CLASSES);
    _0x39b22b.classList.add("settings-provider-status--" + (_0x2a96d0?.tone || "unconfigured"));
  };
  const _0x5a40b1 = _0x37fcd6 => {
    const _0x295734 = _0x56adeb(_0x37fcd6);
    const _0x2ce845 = _0x295734.map(readCardStatus).filter(Boolean);
    const _0x5b540f = aggregateModelServiceProviderStatus(_0x2ce845);
    const _0x335b70 = String(_0x37fcd6.buttonName?.textContent || _0x37fcd6.id).trim();
    const _0xe12f94 = String(_0x5b540f?.text || "").trim() || t("settings.apiInput.readiness.requiredShort");
    _0x37fcd6.button.dataset.modelServiceStatus = _0x5b540f?.tone || "unconfigured";
    _0x37fcd6.button.dataset.tooltip = _0x335b70 + "：" + _0xe12f94;
    _0x37fcd6.button.setAttribute("aria-label", _0x335b70 + "，" + _0xe12f94);
    _0x37fcd6.button.classList.toggle("is-verified", _0x5b540f?.tone === "success");
    _0x37fcd6.routeButtons.forEach(({
      card: _0x25ea53,
      status: _0x5a6061
    }) => {
      _0x4ecb7b(_0x5a6061, readCardStatus(_0x25ea53) || {
        text: t("settings.apiInput.readiness.requiredShort"),
        tone: "unconfigured"
      });
    });
  };
  const _0x2afe89 = (_0x3f0bcb, _0x2dfb1a = "") => {
    if (!_0x3f0bcb?.routeButtons?.size) {
      return false;
    }
    const _0x3c065f = Array.from(_0x3f0bcb.routeButtons.entries()).filter(([, _0x2a5a5f]) => isCardAvailable(_0x2a5a5f.card, _0x36075c));
    const _0x3291dc = _0x3c065f.find(([_0x23cbfb]) => _0x23cbfb === _0x2dfb1a) || _0x3c065f.find(([_0x26d97f]) => _0x26d97f === _0x3f0bcb.activeRouteId) || _0x3c065f[0];
    if (!_0x3291dc) {
      return false;
    }
    _0x3f0bcb.activeRouteId = _0x3291dc[0];
    _0x3f0bcb.routeButtons.forEach((_0x538851, _0x5e935c) => {
      const _0x179e41 = _0x5e935c === _0x3f0bcb.activeRouteId;
      const _0x137f72 = isCardAvailable(_0x538851.card, _0x36075c);
      _0x538851.button.hidden = !_0x137f72;
      _0x538851.button.classList.toggle("is-active", _0x179e41);
      _0x538851.button.setAttribute("aria-selected", _0x179e41 ? "true" : "false");
      _0x538851.card.classList.toggle("is-route-hidden", !_0x179e41);
      _0x538851.card.setAttribute("aria-hidden", _0x179e41 ? "false" : "true");
    });
    return true;
  };
  const _0x57098c = _0xc97415 => _0x56adeb(_0xc97415).length > 0 && modelServiceKindsMatchCategory(_0xc97415.kinds, _0x526487);
  const _0x5c0818 = () => _0x5354bd.find(_0x1c6bae => _0x57098c(_0x1c6bae)) || null;
  const _0x4962ab = (_0x40e4f7, _0x4c31dd = {}) => {
    const _0x1af809 = _0x5354bd.find(_0x3ec478 => _0x3ec478.id === _0x40e4f7);
    if (!_0x1af809 || !_0x56adeb(_0x1af809).length) {
      return false;
    }
    if (!modelServiceKindsMatchCategory(_0x1af809.kinds, _0x526487)) {
      _0x54b996("all", {
        preserveProvider: true
      });
    }
    _0x39c8bd = _0x1af809.id;
    _0x5354bd.forEach(_0x5a28b7 => {
      const _0x3d5215 = _0x5a28b7.id === _0x39c8bd;
      _0x5a28b7.wrapper.hidden = !_0x3d5215;
      _0x5a28b7.button.classList.toggle("is-active", _0x3d5215);
      _0x5a28b7.button.setAttribute("aria-pressed", _0x3d5215 ? "true" : "false");
    });
    _0x2afe89(_0x1af809, _0x4c31dd.routeId);
    if (_0x4c31dd.focusButton) {
      _0x1af809.button.focus?.();
    }
    return true;
  };
  const _0x276c05 = () => {
    _0x5354bd.forEach(_0x4e1943 => {
      _0x4e1943.button.hidden = !_0x57098c(_0x4e1943);
      _0x4e1943.routeButtons.forEach(({
        button: _0x123da2,
        card: _0x16a3b3
      }) => {
        _0x123da2.hidden = !isCardAvailable(_0x16a3b3, _0x36075c);
      });
      _0x5a40b1(_0x4e1943);
    });
    const _0x58af00 = _0x5354bd.find(_0x3a6cc2 => _0x3a6cc2.id === _0x39c8bd);
    if (!_0x58af00 || !_0x57098c(_0x58af00)) {
      const _0x3feb4e = _0x5c0818();
      if (_0x3feb4e) {
        _0x4962ab(_0x3feb4e.id);
      }
      return;
    }
    _0x2afe89(_0x58af00, _0x58af00.activeRouteId);
  };
  function _0x54b996(_0x1b8e45, _0x107171 = {}) {
    const _0x23eee0 = MODEL_SERVICE_CATEGORY_SET.has(_0x1b8e45) ? _0x1b8e45 : "all";
    _0x526487 = _0x23eee0;
    _0x36bc95.querySelectorAll?.("[data-model-service-category]")?.forEach(_0x2273db => {
      const _0x40af96 = _0x2273db.dataset.modelServiceCategory === _0x526487;
      _0x2273db.classList.toggle("is-active", _0x40af96);
      _0x2273db.setAttribute("aria-pressed", _0x40af96 ? "true" : "false");
    });
    _0x5354bd.forEach(_0x5cb9f9 => {
      _0x5cb9f9.button.hidden = !_0x57098c(_0x5cb9f9);
    });
    const _0x24e736 = _0x5354bd.find(_0x11beb0 => _0x11beb0.id === _0x39c8bd);
    if (!_0x107171.preserveProvider && (!_0x24e736 || !_0x57098c(_0x24e736))) {
      const _0x48e04a = _0x5c0818();
      if (_0x48e04a) {
        _0x4962ab(_0x48e04a.id);
      }
    }
  }
  const _0x52f90f = _0x37db17 => {
    const _0x1a776b = _0x37db17?.closest?.("[data-model-service-provider]");
    if (!_0x1a776b) {
      return false;
    }
    const _0x1834be = String(_0x1a776b.dataset.modelServiceProvider || "").trim();
    const _0x5e0d55 = String(_0x1a776b.dataset.modelServiceRoute || "").trim();
    const _0x2c0b41 = _0x5354bd.find(_0x1e4b44 => _0x1e4b44.id === _0x1834be);
    if (!_0x2c0b41) {
      return false;
    }
    if (!modelServiceKindsMatchCategory(_0x2c0b41.kinds, _0x526487)) {
      _0x54b996("all", {
        preserveProvider: true
      });
    }
    return _0x4962ab(_0x1834be, {
      routeId: _0x5e0d55
    });
  };
  _0x36bc95.querySelectorAll?.("[data-model-service-category]")?.forEach(_0x433e45 => {
    _0x433e45.addEventListener("click", () => {
      _0x54b996(_0x433e45.dataset.modelServiceCategory || "all");
    });
    _0x433e45.addEventListener("keydown", _0x2e2171 => {
      if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(_0x2e2171.key)) {
        return;
      }
      const _0x5be2ba = Array.from(_0x36bc95.querySelectorAll("[data-model-service-category]"));
      const _0x2c3616 = Math.max(0, _0x5be2ba.indexOf(_0x433e45));
      const _0x5e8736 = _0x2e2171.key === "Home" ? 0 : _0x2e2171.key === "End" ? _0x5be2ba.length - 1 : (_0x2c3616 + (_0x2e2171.key === "ArrowRight" ? 1 : -1) + _0x5be2ba.length) % _0x5be2ba.length;
      _0x2e2171.preventDefault();
      _0x5be2ba[_0x5e8736]?.focus?.();
      _0x5be2ba[_0x5e8736]?.click?.();
    });
  });
  _0x5354bd.forEach(_0x26fbdd => {
    _0x26fbdd.button.addEventListener("click", () => {
      _0x4962ab(_0x26fbdd.id);
    });
    _0x26fbdd.routeButtons.forEach(({
      button: _0x38a314
    }, _0x45e51c) => {
      _0x38a314.addEventListener("click", () => _0x2afe89(_0x26fbdd, _0x45e51c));
    });
    if (typeof globalThis.MutationObserver === "function") {
      const _0x294006 = new globalThis.MutationObserver(() => {
        _0x276c05();
      });
      _0x26fbdd.cards.forEach(_0x2faa02 => {
        _0x294006.observe(_0x2faa02, {
          attributes: true,
          attributeFilter: ["hidden", "class"],
          childList: true,
          subtree: true,
          characterData: true
        });
      });
      _0x354ac4.push(_0x294006);
    }
  });
  if (typeof globalThis.MutationObserver === "function" && _0x36075c.body) {
    const _0x3acba9 = new globalThis.MutationObserver(_0x276c05);
    _0x3acba9.observe(_0x36075c.body, {
      attributes: true,
      attributeFilter: ["class"]
    });
    _0x354ac4.push(_0x3acba9);
  }
  const _0x25a455 = onLocaleChange(() => {
    globalThis.queueMicrotask?.(() => {
      _0x5354bd.forEach(_0x36ab64 => {
        _0x36ab64.buttonName.textContent = getProviderLabel(_0x36ab64.id, _0x36ab64.cards[0]);
        _0x36ab64.routeButtons.forEach(({
          card: _0x1dcf88,
          name: _0x4014ce
        }, _0x1811d4) => {
          _0x4014ce.textContent = getRouteLabel(_0x1811d4, _0x1dcf88);
        });
        _0x5a40b1(_0x36ab64);
      });
    });
  });
  _0x276c05();
  const _0x29969f = _0x5c0818();
  if (_0x29969f) {
    _0x4962ab(_0x29969f.id);
  }
  _0x36bc95.classList.add("is-enhanced");
  return {
    activateProvider: _0x4962ab,
    activateRoute: _0x2afe89,
    revealField: _0x52f90f,
    setCategory: _0x54b996,
    sync: _0x276c05,
    destroy() {
      _0x354ac4.forEach(_0x522df5 => _0x522df5.disconnect?.());
      _0x25a455?.();
      if (activeNavigator === this) {
        activeNavigator = null;
      }
    }
  };
}
export function initModelServiceSettingsNavigator(_0x187835 = globalThis.document) {
  if (!_0x187835?.getElementById) {
    return null;
  }
  const _0x43b1d9 = _0x187835.getElementById("modelServiceBrowser");
  const _0x3eca84 = _0x187835.getElementById("modelServiceProviderPicker");
  const _0x28bfb1 = _0x187835.getElementById("modelServiceProviderDetails");
  if (!_0x43b1d9 || !_0x3eca84 || !_0x28bfb1) {
    return null;
  }
  if (activeNavigator) {
    return activeNavigator;
  }
  const _0x2144f2 = Array.from(_0x187835.querySelectorAll?.("[data-model-service-provider]") || []);
  const _0x1304be = new Map();
  _0x2144f2.forEach(_0x563176 => {
    const _0x13e429 = String(_0x563176.dataset.modelServiceProvider || "").trim();
    if (!_0x13e429) {
      return;
    }
    const _0x12616d = _0x1304be.get(_0x13e429) || [];
    _0x12616d.push(_0x563176);
    _0x1304be.set(_0x13e429, _0x12616d);
  });
  const _0x4289be = Array.from(_0x1304be.entries()).map(([_0x2c0efa, _0x29a733]) => createProviderGroup(_0x187835, _0x2c0efa, _0x29a733, _0x28bfb1));
  _0x4289be.forEach(_0x5e520e => createProviderButton(_0x187835, _0x5e520e, _0x3eca84));
  activeNavigator = createNavigatorController({
    documentObject: _0x187835,
    browserEl: _0x43b1d9,
    pickerEl: _0x3eca84,
    detailsEl: _0x28bfb1,
    groups: _0x4289be
  });
  return activeNavigator;
}
export function revealModelServiceSettingsField(_0x2191ca) {
  return activeNavigator?.revealField?.(_0x2191ca) || false;
}