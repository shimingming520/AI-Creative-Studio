import { RH_AUDIO_ADVANCED_VOICE_CLONE_MODEL_ID, RH_AUDIO_ADVANCED_VOICE_CLONE_RUNNINGHUB_MODEL_ID, getModelManifest } from "../manifests/index.js";
import { RH_AUDIO_ADVANCED_VOICE_CLONE_HELP_TOOLTIP } from "../manifests/audio/runninghub/runningHubAudioAdvancedVoiceCloneManifest.js";
import { t } from "../i18n/index.js";
import { translateManifestText } from "../i18n/manifestText.js";
import { createPromptPresetTriggerController } from "./promptPresetTrigger.js";
export const ADVANCED_VOICE_CLONE_HELP_TOOLTIP = RH_AUDIO_ADVANCED_VOICE_CLONE_HELP_TOOLTIP;
const HELP_HIGHLIGHT_PATTERN = /\[\[red:([^\]]+)\]\]/g;
const ADVANCED_VOICE_CLONE_ALIASES = [RH_AUDIO_ADVANCED_VOICE_CLONE_MODEL_ID, RH_AUDIO_ADVANCED_VOICE_CLONE_RUNNINGHUB_MODEL_ID, ...(getModelManifest(RH_AUDIO_ADVANCED_VOICE_CLONE_MODEL_ID)?.subscriptionAliases || []), "进阶声音克隆"];
const GENERATION_NODE_HELP_TOOLTIP_MAP = Object.fromEntries(ADVANCED_VOICE_CLONE_ALIASES.map(_0x5f12cc => ["audio:" + String(_0x5f12cc || "").trim(), ADVANCED_VOICE_CLONE_HELP_TOOLTIP]).filter(([_0x8151a0]) => _0x8151a0 !== "audio:"));
function helpTipText(_0x1a08d1, _0x132717 = {}) {
  return t("generationNodeHelpTip." + _0x1a08d1, _0x132717);
}
function getHelpConditionFieldValue(_0x3affd7 = {}, _0x117a39 = "") {
  const _0x18d418 = String(_0x117a39 || "").trim();
  if (!_0x18d418) {
    return undefined;
  }
  const _0x8cb546 = _0x3affd7?.generationParams && typeof _0x3affd7.generationParams === "object" ? _0x3affd7.generationParams : {};
  if (Object.prototype.hasOwnProperty.call(_0x8cb546, _0x18d418)) {
    return _0x8cb546[_0x18d418];
  }
  if (Object.prototype.hasOwnProperty.call(_0x3affd7 || {}, _0x18d418)) {
    return _0x3affd7[_0x18d418];
  }
  const _0x44a6b6 = _0x18d418.split(".").filter(Boolean);
  if (_0x44a6b6.length <= 1) {
    return undefined;
  }
  let _0x50a516 = _0x3affd7;
  for (const _0x159e55 of _0x44a6b6) {
    if (!_0x50a516 || typeof _0x50a516 !== "object") {
      return undefined;
    }
    _0x50a516 = _0x50a516[_0x159e55];
  }
  return _0x50a516;
}
function helpConditionMatches(_0x54e7ea, _0x24c798 = {}) {
  if (!_0x54e7ea || typeof _0x54e7ea !== "object") {
    return false;
  }
  if (Array.isArray(_0x54e7ea.any)) {
    return _0x54e7ea.any.some(_0x42cfa1 => helpConditionMatches(_0x42cfa1, _0x24c798));
  }
  if (Array.isArray(_0x54e7ea.all)) {
    return _0x54e7ea.all.every(_0x451e53 => helpConditionMatches(_0x451e53, _0x24c798));
  }
  const _0x42e1fe = String(_0x54e7ea.field || "").trim();
  if (!_0x42e1fe) {
    return false;
  }
  const _0x2bcf9f = getHelpConditionFieldValue(_0x24c798, _0x42e1fe);
  const _0x49c9fa = Array.isArray(_0x54e7ea.values) ? _0x54e7ea.values : Object.prototype.hasOwnProperty.call(_0x54e7ea, "value") ? [_0x54e7ea.value] : [];
  if (_0x49c9fa.length === 0) {
    return Boolean(_0x2bcf9f);
  }
  return _0x49c9fa.some(_0x4a0cf4 => _0x2bcf9f === _0x4a0cf4 || String(_0x2bcf9f ?? "") === String(_0x4a0cf4 ?? ""));
}
function resolveManifestHelpText(_0x5558d2, _0x4890da = {}) {
  const _0x1b5892 = _0x5558d2?.help;
  if (!_0x1b5892 || typeof _0x1b5892 !== "object") {
    return "";
  }
  const _0x37788d = Array.isArray(_0x1b5892.variants) ? _0x1b5892.variants : [];
  for (const _0x30f6e2 of _0x37788d) {
    if (_0x30f6e2 && typeof _0x30f6e2 === "object" && helpConditionMatches(_0x30f6e2.when, _0x4890da)) {
      const _0x5750ff = String(_0x30f6e2.tooltip || _0x30f6e2.text || "").trim();
      if (_0x5750ff) {
        return translateManifestText(_0x5750ff);
      }
    }
  }
  const _0x331da5 = String(_0x1b5892.tooltip || _0x1b5892.text || "").trim();
  if (_0x331da5) {
    return translateManifestText(_0x331da5);
  } else {
    return "";
  }
}
export function getGenerationNodeHelpTooltip({
  kind = "",
  key = "",
  model = "",
  label = "",
  nodeData = {}
} = {}) {
  const _0x3daabd = String(kind || "").trim();
  const _0x588df0 = [key, model, label].map(_0x27832c => String(_0x27832c || "").trim()).filter(Boolean);
  for (const _0x498c3e of _0x588df0) {
    const _0x35d829 = getModelManifest(_0x498c3e);
    const _0x2bccf6 = resolveManifestHelpText(_0x35d829, nodeData);
    if (_0x2bccf6) {
      return _0x2bccf6;
    }
    const _0x18adf8 = _0x3daabd ? _0x3daabd + ":" + _0x498c3e : "";
    const _0x566ced = _0x18adf8 && GENERATION_NODE_HELP_TOOLTIP_MAP[_0x18adf8] || GENERATION_NODE_HELP_TOOLTIP_MAP[_0x498c3e] || "";
    if (_0x566ced) {
      return translateManifestText(_0x566ced);
    }
  }
  return "";
}
export function stripGenerationNodeHelpMarkup(_0x53db6f = "") {
  HELP_HIGHLIGHT_PATTERN.lastIndex = 0;
  return String(_0x53db6f || "").replace(HELP_HIGHLIGHT_PATTERN, "$1");
}
export function createGenerationNodeHelpTipController({
  panel: _0x4631e0,
  getHelpText: _0x796390,
  ariaLabel = helpTipText("ariaLabel")
} = {}) {
  let _0x4b9666 = null;
  let _0x14dcc6 = null;
  let _0x182295 = null;
  const _0x597789 = () => typeof _0x796390 === "function" ? String(_0x796390() || "") : "";
  const _0x17e78c = (_0x5bfcf4, _0x59c62f) => {
    const _0x5aa647 = String(_0x59c62f || "");
    HELP_HIGHLIGHT_PATTERN.lastIndex = 0;
    let _0x23afb0 = 0;
    let _0x173a08 = HELP_HIGHLIGHT_PATTERN.exec(_0x5aa647);
    while (_0x173a08) {
      if (_0x173a08.index > _0x23afb0) {
        _0x5bfcf4.appendChild(document.createTextNode(_0x5aa647.slice(_0x23afb0, _0x173a08.index)));
      }
      const _0x2bbde2 = document.createElement("span");
      _0x2bbde2.className = "generation-node-help-emphasis";
      _0x2bbde2.textContent = _0x173a08[1];
      _0x5bfcf4.appendChild(_0x2bbde2);
      _0x23afb0 = _0x173a08.index + _0x173a08[0].length;
      _0x173a08 = HELP_HIGHLIGHT_PATTERN.exec(_0x5aa647);
    }
    if (_0x23afb0 < _0x5aa647.length) {
      _0x5bfcf4.appendChild(document.createTextNode(_0x5aa647.slice(_0x23afb0)));
    }
  };
  const _0x1d627c = (_0x32382a, _0x1c3627, _0x1dab5b = "") => {
    const _0x3bd7b1 = document.createElement("div");
    if (_0x1dab5b) {
      _0x3bd7b1.className = _0x1dab5b;
    }
    _0x17e78c(_0x3bd7b1, _0x1c3627);
    _0x32382a.appendChild(_0x3bd7b1);
    return _0x3bd7b1;
  };
  const _0x413c99 = (_0x2c1eee, _0x5c2c79, _0x374abe) => {
    const _0x1d0593 = document.createElement("div");
    _0x1d0593.className = "generation-node-help-example-line";
    const _0x352bcf = document.createElement("span");
    _0x352bcf.className = "generation-node-help-ref-pill";
    _0x352bcf.textContent = _0x5c2c79;
    _0x1d0593.appendChild(_0x352bcf);
    _0x1d0593.appendChild(document.createTextNode(" " + _0x374abe));
    _0x2c1eee.appendChild(_0x1d0593);
  };
  const _0x1d1960 = (_0x4e06bf, _0x31b52d) => {
    String(_0x31b52d || "").split("\n").forEach((_0xb81775, _0x4eb4be) => {
      _0x1d627c(_0x4e06bf, _0xb81775, _0x4eb4be === 0 && /用法$/.test(String(_0xb81775 || "").trim()) ? "generation-node-help-title" : "");
    });
  };
  const _0x5486f8 = (_0x3dba22 = "") => String(_0x3dba22 || "").trim().replace(/^\|/, "").replace(/\|$/, "").split("|").map(_0x13e6de => _0x13e6de.trim().replace(/^`|`$/g, ""));
  const _0xd32449 = (_0x570158 = "") => /^\s*\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?\s*$/.test(String(_0x570158 || ""));
  const _0x21b452 = (_0x3f9263, _0x2e9c41) => {
    const _0x38f24c = String(_0x2e9c41 || "").split("\n");
    const _0x2b2ddc = _0x38f24c.findIndex((_0xb8158b, _0x1630f3) => {
      if (_0x1630f3 === 0 || !_0xd32449(_0xb8158b)) {
        return false;
      }
      return String(_0x38f24c[_0x1630f3 - 1] || "").includes("|");
    });
    if (_0x2b2ddc < 1) {
      return false;
    }
    _0x38f24c.slice(0, _0x2b2ddc - 1).forEach((_0x4d351c, _0x55f165) => {
      const _0x4874ca = String(_0x4d351c || "").trim();
      if (!_0x4874ca) {
        return;
      }
      _0x1d627c(_0x3f9263, _0x4874ca, _0x55f165 === 0 && /用法说明$/.test(_0x4874ca) ? "generation-node-help-title" : "");
    });
    const _0x1cdfb5 = document.createElement("table");
    _0x1cdfb5.className = "generation-node-help-table";
    const _0xd9cfe7 = document.createElement("thead");
    const _0x598c80 = document.createElement("tr");
    _0x5486f8(_0x38f24c[_0x2b2ddc - 1]).forEach(_0x51e0b0 => {
      const _0x1928cf = document.createElement("th");
      _0x17e78c(_0x1928cf, _0x51e0b0);
      _0x598c80.appendChild(_0x1928cf);
    });
    _0xd9cfe7.appendChild(_0x598c80);
    _0x1cdfb5.appendChild(_0xd9cfe7);
    const _0xf839da = document.createElement("tbody");
    _0x38f24c.slice(_0x2b2ddc + 1).forEach(_0x1dbf70 => {
      if (!String(_0x1dbf70 || "").includes("|")) {
        return;
      }
      const _0x11ed2c = document.createElement("tr");
      _0x5486f8(_0x1dbf70).forEach(_0x5a226f => {
        const _0x1a2e46 = document.createElement("td");
        _0x17e78c(_0x1a2e46, _0x5a226f);
        _0x11ed2c.appendChild(_0x1a2e46);
      });
      _0xf839da.appendChild(_0x11ed2c);
    });
    _0x1cdfb5.appendChild(_0xf839da);
    _0x3f9263.appendChild(_0x1cdfb5);
    return true;
  };
  const _0x1eb765 = (_0x47bd6a, _0x1cbbb8) => {
    _0x47bd6a.textContent = "";
    _0x47bd6a.classList.remove("has-table");
    if (_0x21b452(_0x47bd6a, _0x1cbbb8)) {
      _0x47bd6a.classList.add("has-table");
      return;
    }
    if (_0x1cbbb8 !== ADVANCED_VOICE_CLONE_HELP_TOOLTIP) {
      _0x1d1960(_0x47bd6a, _0x1cbbb8);
      return;
    }
    _0x1d627c(_0x47bd6a, helpTipText("advancedVoiceClone.title"), "generation-node-help-title");
    _0x1d627c(_0x47bd6a, helpTipText("advancedVoiceClone.duration"));
    _0x1d627c(_0x47bd6a, helpTipText("advancedVoiceClone.noAudio"));
    _0x1d627c(_0x47bd6a, helpTipText("advancedVoiceClone.promptExample"), "generation-node-help-muted-line");
    _0x1d627c(_0x47bd6a, helpTipText("advancedVoiceClone.oneAudio"));
    _0x1d627c(_0x47bd6a, helpTipText("advancedVoiceClone.twoAudio"));
    _0x1d627c(_0x47bd6a, helpTipText("advancedVoiceClone.examples"));
    _0x413c99(_0x47bd6a, helpTipText("advancedVoiceClone.audio1"), helpTipText("advancedVoiceClone.exampleSpeaker1"));
    _0x413c99(_0x47bd6a, helpTipText("advancedVoiceClone.audio2"), helpTipText("advancedVoiceClone.exampleSpeaker2"));
    return;
    _0x1d627c(_0x47bd6a, "进阶声音克隆用法", "generation-node-help-title");
    _0x1d627c(_0x47bd6a, "支持 [[red:3~15 秒音频]]");
    _0x1d627c(_0x47bd6a, "[[red:无音频入参]]时 TTS语音 根据提示词生成随机音色");
    _0x1d627c(_0x47bd6a, "例：今晚月色真好", "generation-node-help-muted-line");
    _0x1d627c(_0x47bd6a, "[[red:1个音频入参]]时 克隆语音");
    _0x1d627c(_0x47bd6a, "[[red:2个音频入参]]时 多人克隆音色对话");
    _0x1d627c(_0x47bd6a, "例：");
    _0x413c99(_0x47bd6a, "@音频1", "你今晚回家吗");
    _0x413c99(_0x47bd6a, "@音频2", "不回了加班要忙到很晚");
  };
  const _0x2d1f26 = () => {
    if (!_0x4631e0) {
      return null;
    }
    if (_0x4b9666 && _0x4b9666.parentNode === _0x4631e0) {
      return _0x4b9666;
    }
    const _0x24ac7e = _0x4631e0.querySelector(".generation-node-help-tip");
    if (_0x24ac7e) {
      _0x4b9666 = _0x24ac7e;
      return _0x24ac7e;
    }
    const _0x4de055 = document.createElement("button");
    _0x4de055.type = "button";
    _0x4de055.className = "rh-tip generation-node-help-tip";
    _0x4de055.textContent = "!";
    _0x4de055.setAttribute("aria-label", ariaLabel);
    _0x4de055.addEventListener("mouseenter", _0x4ed562);
    _0x4de055.addEventListener("mouseleave", _0x4b303c);
    _0x4de055.addEventListener("focus", _0x4ed562);
    _0x4de055.addEventListener("blur", _0x4b303c);
    _0x4de055.addEventListener("click", _0x16ae3f => {
      _0x16ae3f.preventDefault();
      _0x16ae3f.stopPropagation();
    });
    _0x4de055.addEventListener("pointerdown", _0x5df403 => {
      _0x5df403.preventDefault();
      _0x5df403.stopPropagation();
    });
    _0x4631e0.appendChild(_0x4de055);
    _0x4b9666 = _0x4de055;
    return _0x4de055;
  };
  const _0x13c5b2 = () => {
    if (_0x14dcc6?.isConnected) {
      return _0x14dcc6;
    }
    const _0x3a8e7e = document.createElement("div");
    _0x3a8e7e.className = "generation-node-help-tooltip-portal";
    _0x3a8e7e.setAttribute("role", "tooltip");
    document.body.appendChild(_0x3a8e7e);
    _0x14dcc6 = _0x3a8e7e;
    return _0x3a8e7e;
  };
  const _0x7fa2ec = () => {
    if (!_0x4b9666 || !_0x14dcc6) {
      return;
    }
    const _0x515e40 = 12;
    const _0x465f96 = _0x4b9666.getBoundingClientRect();
    const _0x3da2d7 = _0x14dcc6.offsetWidth || 340;
    const _0x10779f = _0x14dcc6.offsetHeight || 0;
    const _0x5f286d = Math.max(_0x515e40, window.innerWidth - _0x3da2d7 - _0x515e40);
    const _0x34421f = _0x465f96.right - _0x3da2d7 + 6;
    const _0x56ceed = Math.min(Math.max(_0x515e40, _0x34421f), _0x5f286d);
    const _0x1c3e7b = _0x465f96.top - _0x10779f - _0x515e40;
    const _0x257b58 = _0x465f96.bottom + _0x515e40;
    const _0x33871b = _0x1c3e7b < _0x515e40;
    const _0x10ee4d = _0x33871b ? _0x257b58 : _0x1c3e7b;
    const _0x167b57 = Math.min(Math.max(_0x465f96.left + _0x465f96.width / 2 - _0x56ceed, 16), _0x3da2d7 - 16);
    _0x14dcc6.style.left = _0x56ceed + "px";
    _0x14dcc6.style.top = _0x10ee4d + "px";
    _0x14dcc6.classList.toggle("is-below", _0x33871b);
    _0x14dcc6.style.setProperty("--generation-node-help-tooltip-arrow-left", _0x167b57 + "px");
  };
  const _0x4ed562 = () => {
    const _0x7246b0 = _0x597789();
    if (!_0x7246b0 || _0x4b9666?.classList.contains("is-hidden")) {
      return;
    }
    const _0x9422f7 = _0x13c5b2();
    _0x1eb765(_0x9422f7, _0x7246b0);
    _0x9422f7.classList.add("is-open");
    _0x7fa2ec();
    if (!_0x182295) {
      _0x182295 = () => _0x7fa2ec();
      window.addEventListener("scroll", _0x182295, true);
      window.addEventListener("resize", _0x182295);
    }
  };
  const _0x4b303c = () => {
    _0x14dcc6?.classList.remove("is-open");
    if (!_0x182295) {
      return;
    }
    window.removeEventListener("scroll", _0x182295, true);
    window.removeEventListener("resize", _0x182295);
    _0x182295 = null;
  };
  const _0x3a2105 = () => {
    const _0x43d0e6 = _0x4b9666 || _0x2d1f26();
    if (!_0x43d0e6) {
      return;
    }
    const _0x136fff = _0x597789();
    const _0x255de1 = Boolean(_0x136fff);
    _0x43d0e6.classList.toggle("is-hidden", !_0x255de1);
    if (_0x255de1) {
      _0x43d0e6.setAttribute("data-tooltip", stripGenerationNodeHelpMarkup(_0x136fff));
    } else {
      _0x43d0e6.removeAttribute("data-tooltip");
    }
    _0x4631e0?.classList.toggle("has-generation-node-help-tip", _0x255de1);
    if (!_0x255de1) {
      _0x4b303c();
    }
  };
  const _0x4cb72a = () => {
    _0x4b303c();
    _0x14dcc6?.remove();
    _0x14dcc6 = null;
  };
  return {
    sync: _0x3a2105,
    remove: _0x4cb72a
  };
}
export function attachGenerationNodeHelpTip(_0x300034, {
  panel: _0x1477a9,
  kind: _0x2316d4,
  getKey: _0x54aafb,
  getModel = _0x54aafb,
  getLabel: _0x20c219,
  getNodeData: _0x22e5d0,
  ariaLabel: _0x2b3355
} = {}) {
  if (!_0x300034 || !_0x1477a9) {
    return null;
  }
  _0x300034._generationNodeHelpTip = createGenerationNodeHelpTipController({
    panel: _0x1477a9,
    getHelpText: () => getGenerationNodeHelpTooltip({
      kind: _0x2316d4,
      key: typeof _0x54aafb === "function" ? _0x54aafb() : "",
      model: typeof getModel === "function" ? getModel() : "",
      label: typeof _0x20c219 === "function" ? _0x20c219() : "",
      nodeData: typeof _0x22e5d0 === "function" ? _0x22e5d0() : {}
    }),
    ariaLabel: _0x2b3355
  });
  _0x300034._generationNodeHelpTip.sync();
  return _0x300034._generationNodeHelpTip;
}
export function attachGenerationNodePromptTools(_0x23af31, _0x304094 = {}) {
  if (!_0x23af31 || !_0x304094?.panel) {
    return null;
  }
  _0x23af31._promptPresetTrigger?.remove?.();
  _0x23af31._promptPresetTrigger = createPromptPresetTriggerController({
    panel: _0x304094.panel,
    getPromptEl: () => _0x23af31.promptEl,
    getNodeType: () => _0x23af31._data?.type,
    getNodeId: () => _0x23af31.nodeId,
    onGenerate: (_0x4766ce, _0x4e265f) => _0x23af31._onGenerate?.(_0x4766ce, _0x4e265f)
  });
  return attachGenerationNodeHelpTip(_0x23af31, _0x304094);
}