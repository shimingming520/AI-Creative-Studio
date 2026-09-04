import { ensureThumbDecoded } from "../refThumbMediaReveal.js";
const imageSourceReconcileTokens = new WeakMap();
function syncElementAttributes(_0x16071e, _0x184e7b, {
  preserveAttributeNames = []
} = {}) {
  if (!_0x16071e || !_0x184e7b) {
    return false;
  }
  const _0x352b6d = new Set(preserveAttributeNames);
  const _0x34dfeb = new Set(Array.from(_0x184e7b.attributes || [], _0x11cf4a => _0x11cf4a.name));
  Array.from(_0x16071e.attributes || []).forEach(_0x4cc06b => {
    if (!_0x352b6d.has(_0x4cc06b.name) && !_0x34dfeb.has(_0x4cc06b.name)) {
      _0x16071e.removeAttribute?.(_0x4cc06b.name);
    }
  });
  Array.from(_0x184e7b.attributes || []).forEach(_0x754fb1 => {
    if (!_0x352b6d.has(_0x754fb1.name) && _0x16071e.getAttribute?.(_0x754fb1.name) !== _0x754fb1.value) {
      _0x16071e.setAttribute?.(_0x754fb1.name, _0x754fb1.value);
    }
  });
  return true;
}
function hasEquivalentNodeShape(_0x25ea7c, _0x3217be) {
  if (!_0x25ea7c || !_0x3217be || _0x25ea7c.nodeType !== _0x3217be.nodeType) {
    return false;
  }
  if (_0x25ea7c.nodeType === 1 && _0x25ea7c.tagName !== _0x3217be.tagName) {
    return false;
  }
  const _0x3bf6c2 = Array.from(_0x25ea7c.childNodes || []);
  const _0x5ba4d2 = Array.from(_0x3217be.childNodes || []);
  return _0x3bf6c2.length === _0x5ba4d2.length && _0x3bf6c2.every((_0x3cc038, _0x2f3c1a) => hasEquivalentNodeShape(_0x3cc038, _0x5ba4d2[_0x2f3c1a]));
}
function reconcileImageNode(_0x4cc227, _0x85196e) {
  const _0xff1396 = String(_0x4cc227.getAttribute?.("src") || "").trim();
  const _0x26987f = String(_0x85196e.getAttribute?.("src") || "").trim();
  if (_0xff1396 === _0x26987f) {
    imageSourceReconcileTokens.delete(_0x4cc227);
    syncElementAttributes(_0x4cc227, _0x85196e);
    return;
  }
  const _0x13eaa0 = Symbol(_0x26987f);
  imageSourceReconcileTokens.set(_0x4cc227, _0x13eaa0);
  syncElementAttributes(_0x4cc227, _0x85196e, {
    preserveAttributeNames: ["src"]
  });
  const _0x1b8bfe = _0x586fb0 => {
    if (imageSourceReconcileTokens.get(_0x4cc227) !== _0x13eaa0 || _0x4cc227.isConnected === false) {
      return;
    }
    syncElementAttributes(_0x4cc227, _0x85196e);
    if (_0x586fb0 && _0x4cc227.classList?.contains?.("ref-thumb-media")) {
      _0x4cc227.classList.remove("is-pending");
      _0x4cc227.classList.add("is-ready");
    }
    imageSourceReconcileTokens.delete(_0x4cc227);
  };
  if (!_0x26987f) {
    _0x1b8bfe(false);
    return;
  }
  ensureThumbDecoded(_0x26987f).then(_0x1b8bfe, () => _0x1b8bfe(false));
}
function syncEquivalentNodeTree(_0x473876, _0x499037, {
  preserveImageNodes = false
} = {}) {
  if (_0x473876?.nodeType === 1 && _0x499037?.nodeType === 1 && _0x473876.tagName === "IMG" && _0x499037.tagName === "IMG") {
    if (preserveImageNodes) {
      reconcileImageNode(_0x473876, _0x499037);
    } else if (_0x473876.getAttribute?.("src") !== _0x499037.getAttribute?.("src") && typeof _0x473876.replaceWith === "function") {
      _0x473876.replaceWith(_0x499037);
    } else {
      syncElementAttributes(_0x473876, _0x499037);
    }
    return;
  }
  if (_0x473876.nodeType === 1) {
    syncElementAttributes(_0x473876, _0x499037);
  } else if (_0x473876.nodeValue !== _0x499037.nodeValue) {
    _0x473876.nodeValue = _0x499037.nodeValue;
  }
  const _0x4567bb = Array.from(_0x473876.childNodes || []);
  const _0x293055 = Array.from(_0x499037.childNodes || []);
  _0x4567bb.forEach((_0x29f6cc, _0x9b6711) => {
    syncEquivalentNodeTree(_0x29f6cc, _0x293055[_0x9b6711], {
      preserveImageNodes: preserveImageNodes
    });
  });
}
function reconcileElementTree(_0x8c88fb, _0xe69c2d, {
  preserveImageNodes = false
} = {}) {
  if (!_0x8c88fb || !_0xe69c2d) {
    return false;
  }
  if (hasEquivalentNodeShape(_0x8c88fb, _0xe69c2d)) {
    syncEquivalentNodeTree(_0x8c88fb, _0xe69c2d, {
      preserveImageNodes: preserveImageNodes
    });
    return true;
  }
  syncElementAttributes(_0x8c88fb, _0xe69c2d);
  _0x8c88fb.replaceChildren?.(...Array.from(_0xe69c2d.childNodes || []));
  return true;
}
function reconcileElementChildren(_0x3d60a3, _0x152dcf, {
  preserveImageNodes = false
} = {}) {
  if (!_0x3d60a3 || !_0x152dcf) {
    return false;
  }
  const _0x12ad35 = Array.from(_0x3d60a3.childNodes || []);
  const _0x28abc8 = Array.from(_0x152dcf.childNodes || []);
  if (_0x12ad35.length === _0x28abc8.length && _0x12ad35.every((_0xaeb6d1, _0x30ecbc) => hasEquivalentNodeShape(_0xaeb6d1, _0x28abc8[_0x30ecbc]))) {
    _0x12ad35.forEach((_0x426129, _0x29a089) => {
      syncEquivalentNodeTree(_0x426129, _0x28abc8[_0x29a089], {
        preserveImageNodes: preserveImageNodes
      });
    });
    return true;
  }
  _0x3d60a3.replaceChildren?.(..._0x28abc8);
  return true;
}
function getShotTimelineCardRoot(_0x1c48f9) {
  const _0x3f5a9c = _0x1c48f9?.parentElement;
  if (_0x3f5a9c?.matches?.(".person-replacement-shot-card-shell")) {
    return _0x3f5a9c;
  } else {
    return _0x1c48f9;
  }
}
function reconcileShotTimelineCardPair(_0x41a858, _0x1daa2a) {
  if (!_0x41a858 || !_0x1daa2a) {
    return false;
  }
  const _0x3a035d = getShotTimelineCardRoot(_0x41a858);
  const _0x391952 = getShotTimelineCardRoot(_0x1daa2a);
  const _0x17b7f3 = Array.from(_0x3a035d?.querySelectorAll?.("img") || []);
  const _0x297d32 = Array.from(_0x391952?.querySelectorAll?.("img") || []);
  _0x17b7f3.forEach((_0x15af3f, _0x153e38) => {
    const _0x35960e = _0x297d32[_0x153e38];
    if (!_0x35960e) {
      return;
    }
    reconcileElementTree(_0x15af3f, _0x35960e, {
      preserveImageNodes: true
    });
    _0x35960e.replaceWith(_0x15af3f);
  });
  reconcileElementTree(_0x41a858, _0x1daa2a, {
    preserveImageNodes: true
  });
  if (_0x3a035d === _0x41a858 || _0x391952 === _0x1daa2a) {
    return true;
  }
  _0x1daa2a.replaceWith(_0x41a858);
  return reconcileElementTree(_0x3a035d, _0x391952, {
    preserveImageNodes: true
  });
}
export function reconcilePersonReplacementShotTimelineCard({
  currentScroller: _0x2cf313,
  nextScroller: _0x244a38,
  shotId = ""
} = {}) {
  const _0x387472 = String(shotId ?? "").trim();
  if (!_0x387472) {
    return false;
  }
  const _0x2aa5fd = _0x25016e => Array.from(_0x25016e?.querySelectorAll?.("[data-person-replacement-shot-card=\"true\"]") || []).find(_0x2f9459 => String(_0x2f9459.dataset?.shotId ?? "").trim() === _0x387472);
  return reconcileShotTimelineCardPair(_0x2aa5fd(_0x2cf313), _0x2aa5fd(_0x244a38));
}
export function reconcilePersonReplacementShotCardList({
  currentList: _0x242abe,
  nextList: _0xb1fc81
} = {}) {
  if (!_0x242abe || !_0xb1fc81) {
    return false;
  }
  const _0x4d7a83 = new Map(Array.from(_0xb1fc81.querySelectorAll?.("[data-person-replacement-shot-card=\"true\"]") || []).map(_0x19cb52 => [String(_0x19cb52.dataset?.shotId || ""), _0x19cb52]));
  const _0x573de8 = Array.from(_0x242abe.querySelectorAll?.("[data-person-replacement-shot-card=\"true\"]") || []);
  _0x573de8.forEach(_0x2ab127 => {
    const _0x416573 = _0x4d7a83.get(String(_0x2ab127.dataset?.shotId || ""));
    if (!_0x416573) {
      return;
    }
    const _0x3fe5be = getShotTimelineCardRoot(_0x2ab127);
    const _0x157ba7 = getShotTimelineCardRoot(_0x416573);
    reconcileShotTimelineCardPair(_0x2ab127, _0x416573);
    _0x157ba7.replaceWith(_0x3fe5be);
  });
  return reconcileElementChildren(_0x242abe, _0xb1fc81, {
    preserveImageNodes: true
  });
}
function getDirectShotPreview(_0x2bce69) {
  return Array.from(_0x2bce69?.children || []).find(_0x2c4435 => !_0x2c4435.matches?.("[data-person-replacement-shot-timeline-stage]") && !_0x2c4435.matches?.("[data-person-replacement-layout-splitter=\"center\"]") && !_0x2c4435.matches?.(".person-replacement-middle-preview-slide--outgoing")) || null;
}
function getVideoReferenceCards(_0x4c0a00) {
  return Array.from(_0x4c0a00?.querySelectorAll?.("[data-person-replacement-video-reference-index]") || []);
}
function prepareVideoReferenceCardPairs(_0x28cbdd, _0x117b33) {
  const _0x4ed0bf = new Map(getVideoReferenceCards(_0x117b33).map(_0x50ca60 => [String(_0x50ca60.dataset?.personReplacementVideoReferenceIndex ?? ""), _0x50ca60]));
  return getVideoReferenceCards(_0x28cbdd).map(_0x86a2cc => ({
    currentCard: _0x86a2cc,
    nextCard: _0x4ed0bf.get(String(_0x86a2cc.dataset?.personReplacementVideoReferenceIndex ?? ""))
  })).filter(({
    nextCard: _0x3b75b5
  }) => _0x3b75b5);
}
function reconcileVideoElementTree(_0x2361e8, _0x3874a8) {
  return reconcileElementTree(_0x2361e8, _0x3874a8, {
    preserveImageNodes: true
  });
}
function reconcileVideoReferenceRail(_0x411e04, _0x3f9506) {
  if (!_0x411e04 || !_0x3f9506) {
    return false;
  }
  prepareVideoReferenceCardPairs(_0x411e04, _0x3f9506).forEach(({
    currentCard: _0x4ee300,
    nextCard: _0x2d3efc
  }) => {
    reconcileVideoElementTree(_0x4ee300, _0x2d3efc);
    _0x2d3efc.replaceWith(_0x4ee300);
  });
  return reconcileVideoElementTree(_0x411e04, _0x3f9506);
}
export function reconcilePersonReplacementReferenceInputs({
  currentInputs: _0x292064,
  nextInputs: _0x4809eb
} = {}) {
  if (!_0x292064 || !_0x4809eb) {
    return false;
  }
  const _0x31d124 = new Map(Array.from(_0x4809eb.querySelectorAll?.("[data-slot]") || []).map(_0x3bbbbe => [String(_0x3bbbbe.dataset?.slot || ""), _0x3bbbbe]));
  Array.from(_0x292064.querySelectorAll?.("[data-slot]") || []).forEach(_0x25d21a => {
    const _0x42d52f = _0x31d124.get(String(_0x25d21a.dataset?.slot || ""));
    if (!_0x42d52f) {
      return;
    }
    if (_0x25d21a.tagName !== _0x42d52f.tagName) {
      return;
    }
    reconcileVideoElementTree(_0x25d21a, _0x42d52f);
    _0x42d52f.replaceWith(_0x25d21a);
  });
  reconcileVideoElementTree(_0x292064, _0x4809eb);
  _0x4809eb.replaceWith(_0x292064);
  return true;
}
export function reconcilePersonReplacementVideoControlContinuity({
  currentReferenceRail: _0x2ba9c5,
  nextReferenceRail: _0x5a0ad1,
  currentReferenceInputs: _0x558696,
  nextReferenceInputs: _0x4dfb60,
  currentPromptEditor: _0x9df373,
  nextPromptEditor: _0x219f85
} = {}) {
  if (!_0x2ba9c5 || !_0x5a0ad1 || !_0x558696 || !_0x4dfb60 || !_0x9df373 || !_0x219f85) {
    return false;
  }
  if (!reconcileVideoReferenceRail(_0x2ba9c5, _0x5a0ad1)) {
    return false;
  }
  if (!reconcilePersonReplacementReferenceInputs({
    currentInputs: _0x558696,
    nextInputs: _0x4dfb60
  })) {
    return false;
  }
  syncElementAttributes(_0x9df373, _0x219f85);
  _0x219f85.replaceWith(_0x9df373);
  return true;
}
function collectVideoShotSelectionElements(_0x3cf15e, _0x38ed43) {
  const _0x2711a3 = _0x3cf15e?.querySelector?.(".person-replacement-middle-layout");
  const _0x52c754 = _0x38ed43?.querySelector?.(".person-replacement-middle-layout");
  const _0x2050f4 = _0x2711a3?.querySelector?.("[data-person-replacement-shot-timeline-stage]");
  const _0x28516c = _0x52c754?.querySelector?.("[data-person-replacement-shot-timeline-stage]");
  const _0x36017c = _0x3cf15e?.querySelector?.(".person-replacement-video-generation-panel");
  const _0x2a8d70 = _0x38ed43?.querySelector?.(".person-replacement-video-generation-panel");
  return {
    currentReferenceRail: _0x3cf15e?.querySelector?.(".person-replacement-video-reference-assets"),
    nextReferenceRail: _0x38ed43?.querySelector?.(".person-replacement-video-reference-assets"),
    currentLeftSplitter: _0x3cf15e?.querySelector?.("[data-person-replacement-layout-splitter=\"left\"]"),
    nextLeftSplitter: _0x38ed43?.querySelector?.("[data-person-replacement-layout-splitter=\"left\"]"),
    currentMiddle: _0x2711a3,
    nextMiddle: _0x52c754,
    currentPreview: getDirectShotPreview(_0x2711a3),
    nextPreview: getDirectShotPreview(_0x52c754),
    currentScroller: _0x2050f4?.querySelector?.("[data-person-replacement-shot-timeline-scroll]"),
    nextScroller: _0x28516c?.querySelector?.("[data-person-replacement-shot-timeline-scroll]"),
    currentRightSplitter: _0x3cf15e?.querySelector?.("[data-person-replacement-layout-splitter=\"right\"]"),
    nextRightSplitter: _0x38ed43?.querySelector?.("[data-person-replacement-layout-splitter=\"right\"]"),
    currentGenerationPanel: _0x36017c,
    nextGenerationPanel: _0x2a8d70,
    currentReferenceInputs: _0x36017c?.querySelector?.("[data-person-replacement-video-reference-inputs]"),
    nextReferenceInputs: _0x2a8d70?.querySelector?.("[data-person-replacement-video-reference-inputs]"),
    currentFooter: _0x3cf15e?.querySelector?.(".person-replacement-step-footer"),
    nextFooter: _0x38ed43?.querySelector?.(".person-replacement-step-footer")
  };
}
export function reconcilePersonReplacementVideoShotSelection({
  currentPage: _0x2cb589,
  nextPage: _0xd82c39
} = {}) {
  const _0x39c3df = collectVideoShotSelectionElements(_0x2cb589, _0xd82c39);
  if (Object.values(_0x39c3df).some(_0x12dcc0 => !_0x12dcc0)) {
    return false;
  }
  if (!reconcileVideoReferenceRail(_0x39c3df.currentReferenceRail, _0x39c3df.nextReferenceRail)) {
    return false;
  }
  if (!reconcilePersonReplacementReferenceInputs({
    currentInputs: _0x39c3df.currentReferenceInputs,
    nextInputs: _0x39c3df.nextReferenceInputs
  })) {
    return false;
  }
  reconcileVideoElementTree(_0x39c3df.currentPreview, _0x39c3df.nextPreview);
  _0x39c3df.nextPreview.replaceWith(_0x39c3df.currentPreview);
  reconcilePersonReplacementShotCardList({
    currentList: _0x39c3df.currentScroller,
    nextList: _0x39c3df.nextScroller
  });
  _0x39c3df.nextScroller.replaceWith(_0x39c3df.currentScroller);
  reconcileVideoElementTree(_0x39c3df.currentLeftSplitter, _0x39c3df.nextLeftSplitter);
  reconcileVideoElementTree(_0x39c3df.currentMiddle, _0x39c3df.nextMiddle);
  reconcileVideoElementTree(_0x39c3df.currentRightSplitter, _0x39c3df.nextRightSplitter);
  reconcileVideoElementTree(_0x39c3df.currentGenerationPanel, _0x39c3df.nextGenerationPanel);
  reconcileVideoElementTree(_0x39c3df.currentFooter, _0x39c3df.nextFooter);
  return true;
}
function getTargetCharacterCards(_0x261a67) {
  return Array.from(_0x261a67?.querySelectorAll?.("[data-person-replacement-target-character-id]") || []);
}
function prepareTargetCardPairs(_0x2af19b, _0xdcc9f4) {
  const _0x1a6f9c = new Map(getTargetCharacterCards(_0xdcc9f4).map(_0x166be3 => [_0x166be3.dataset?.personReplacementTargetCharacterId || "", _0x166be3]));
  return getTargetCharacterCards(_0x2af19b).map(_0x58d93a => {
    const _0x16ff04 = _0x1a6f9c.get(_0x58d93a.dataset?.personReplacementTargetCharacterId || "");
    return {
      currentCard: _0x58d93a,
      nextCard: _0x16ff04,
      currentMedia: _0x58d93a.querySelector?.(".story-asset-card-media"),
      nextMedia: _0x16ff04?.querySelector?.(".story-asset-card-media")
    };
  });
}
function reconcileTargetCardPair({
  currentCard: _0x2f8626,
  nextCard: _0x585d4c,
  currentMedia: _0x7a39de,
  nextMedia: _0x159b31
}) {
  syncElementAttributes(_0x2f8626, _0x585d4c);
  reconcileElementTree(_0x7a39de, _0x159b31, {
    preserveImageNodes: true
  });
}
function reconcileGenerationCopy(_0x34e9ae) {
  const {
    currentCopy: _0x1b7318,
    nextCopy: _0x55e16c,
    currentPromptField: _0x5c2aea,
    nextPromptField: _0x916aa6,
    currentPromptHeading: _0x1eec18,
    nextPromptHeading: _0x3b0dcc,
    currentPromptReferenceInputs: _0x24d730,
    nextPromptReferenceInputs: _0x27c46f,
    currentPromptEditor: _0x47c591,
    nextPromptEditor: _0x5c85e9,
    currentFooter: _0x62ae89,
    nextFooter: _0x43e0d5,
    currentGenerateButton: _0x547439,
    nextGenerateButton: _0xec04a8
  } = _0x34e9ae;
  syncElementAttributes(_0x1b7318, _0x55e16c);
  syncElementAttributes(_0x5c2aea, _0x916aa6);
  reconcilePersonReplacementReferenceInputs({
    currentInputs: _0x24d730,
    nextInputs: _0x27c46f
  });
  reconcileElementTree(_0x1eec18, _0x3b0dcc, {
    preserveImageNodes: true
  });
  reconcileElementTree(_0x47c591, _0x5c85e9, {
    preserveImageNodes: true
  });
  syncElementAttributes(_0x62ae89, _0x43e0d5);
  _0x547439.replaceWith?.(_0xec04a8);
  Array.from(_0x1b7318.children || []).filter(_0x507dbc => _0x507dbc !== _0x5c2aea && _0x507dbc !== _0x62ae89).forEach(_0xbbec88 => _0xbbec88.remove?.());
  let _0x436c63 = false;
  Array.from(_0x55e16c.children || []).forEach(_0x34ca5f => {
    if (_0x34ca5f === _0x916aa6) {
      return;
    }
    if (_0x34ca5f === _0x43e0d5) {
      _0x436c63 = true;
      return;
    }
    if (_0x436c63) {
      _0x1b7318.append?.(_0x34ca5f);
    } else {
      _0x1b7318.insertBefore?.(_0x34ca5f, _0x62ae89);
    }
  });
}
function collectImageShotSelectionElements(_0xc4784a, _0x37f342) {
  const _0x37067d = _0xc4784a?.querySelector?.(".person-replacement-middle-layout");
  const _0x4680b9 = _0x37f342?.querySelector?.(".person-replacement-middle-layout");
  const _0x100c07 = _0xc4784a?.querySelector?.(".person-replacement-target-assets");
  const _0x580059 = _0x37f342?.querySelector?.(".person-replacement-target-assets");
  const _0x133451 = _0xc4784a?.querySelector?.(".person-replacement-image-generation-panel");
  const _0x20bbf9 = _0x37f342?.querySelector?.(".person-replacement-image-generation-panel");
  const _0x1210df = _0x133451?.querySelector?.(".person-replacement-generation-copy");
  const _0x57598a = _0x20bbf9?.querySelector?.(".person-replacement-generation-copy");
  const _0x28199f = _0x1210df?.querySelector?.(".person-replacement-prompt-field");
  const _0x5349d5 = _0x57598a?.querySelector?.(".person-replacement-prompt-field");
  const _0x5b0f6a = _0x1210df?.querySelector?.(".prompt-panel-footer");
  const _0x2d7e1f = _0x57598a?.querySelector?.(".prompt-panel-footer");
  return {
    currentMiddle: _0x37067d,
    nextMiddle: _0x4680b9,
    currentPreview: getDirectShotPreview(_0x37067d),
    nextPreview: getDirectShotPreview(_0x4680b9),
    currentTargetRail: _0x100c07,
    nextTargetRail: _0x580059,
    currentGenerationPanel: _0x133451,
    nextGenerationPanel: _0x20bbf9,
    currentResultPreview: _0x133451?.querySelector?.(".person-replacement-generation-preview"),
    nextResultPreview: _0x20bbf9?.querySelector?.(".person-replacement-generation-preview"),
    currentCopy: _0x1210df,
    nextCopy: _0x57598a,
    currentPromptField: _0x28199f,
    nextPromptField: _0x5349d5,
    currentPromptHeading: _0x28199f?.querySelector?.(".person-replacement-prompt-field-heading"),
    nextPromptHeading: _0x5349d5?.querySelector?.(".person-replacement-prompt-field-heading"),
    currentPromptReferenceInputs: _0x28199f?.querySelector?.(".person-replacement-prompt-reference-inputs"),
    nextPromptReferenceInputs: _0x5349d5?.querySelector?.(".person-replacement-prompt-reference-inputs"),
    currentPromptEditor: _0x28199f?.querySelector?.("[data-person-replacement-field=\"image-prompt\"]"),
    nextPromptEditor: _0x5349d5?.querySelector?.("[data-person-replacement-field=\"image-prompt\"]"),
    currentFooter: _0x5b0f6a,
    nextFooter: _0x2d7e1f,
    currentModelSelector: _0x5b0f6a?.querySelector?.("[data-aigen-image-model-selector]"),
    nextModelSelector: _0x2d7e1f?.querySelector?.("[data-aigen-image-model-selector]"),
    currentGenerateButton: _0x5b0f6a?.querySelector?.("[data-person-replacement-action=\"generate-replacement-image\"]"),
    nextGenerateButton: _0x2d7e1f?.querySelector?.("[data-person-replacement-action=\"generate-replacement-image\"]")
  };
}
export function reconcilePersonReplacementImageShotSelection({
  currentPage: _0x3eb20e,
  nextPage: _0x462759
} = {}) {
  const _0x1c212a = collectImageShotSelectionElements(_0x3eb20e, _0x462759);
  const _0x17c63c = prepareTargetCardPairs(_0x1c212a.currentTargetRail, _0x1c212a.nextTargetRail);
  const _0x35e73f = Object.values(_0x1c212a);
  if (_0x35e73f.some(_0x59d00f => !_0x59d00f) || _0x17c63c.some(_0x10cba1 => Object.values(_0x10cba1).some(_0x325253 => !_0x325253))) {
    return false;
  }
  reconcileElementTree(_0x1c212a.currentPreview, _0x1c212a.nextPreview, {
    preserveImageNodes: true
  });
  _0x17c63c.forEach(reconcileTargetCardPair);
  _0x1c212a.currentResultPreview.querySelectorAll?.(".person-replacement-image-preview-slide--outgoing")?.forEach?.(_0x33f6bc => _0x33f6bc.remove?.());
  reconcileElementTree(_0x1c212a.currentResultPreview, _0x1c212a.nextResultPreview, {
    preserveImageNodes: true
  });
  reconcileGenerationCopy(_0x1c212a);
  return true;
}