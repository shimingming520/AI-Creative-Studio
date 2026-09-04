import { formatPersonReplacementPersonLabel, isGeneratedPersonReplacementLabel, PERSON_REPLACEMENT_ORIENTATIONS } from "./personReplacementProject.js";
export const PERSON_REPLACEMENT_CUSTOM_LABEL_VALUE = "__person_replacement_custom_label__";
function normalizeText(_0x4f28a3) {
  return String(_0x4f28a3 ?? "").trim();
}
function getPersonReplacementBoundingBox(_0x53c517 = {}) {
  return _0x53c517.locator?.bbox || _0x53c517.bbox || null;
}
function comparePersonReplacementPeopleByPosition(_0x146ce7, _0x522d91) {
  const _0x108be3 = getPersonReplacementBoundingBox(_0x146ce7);
  const _0x278f86 = getPersonReplacementBoundingBox(_0x522d91);
  const _0x52eefa = _0x108be3 ? Number(_0x108be3.x) + Number(_0x108be3.width) / 2 : Infinity;
  const _0x2cedb1 = _0x278f86 ? Number(_0x278f86.x) + Number(_0x278f86.width) / 2 : Infinity;
  const _0x4e94c4 = _0x108be3 ? Number(_0x108be3.y) + Number(_0x108be3.height) / 2 : Infinity;
  const _0x392235 = _0x278f86 ? Number(_0x278f86.y) + Number(_0x278f86.height) / 2 : Infinity;
  return _0x52eefa - _0x2cedb1 || _0x4e94c4 - _0x392235 || normalizeText(_0x146ce7.id).localeCompare(normalizeText(_0x522d91.id), "zh-CN");
}
export function getPersonReplacementIdentityCorrectionDraftKey(_0x15754a, _0xc45b14) {
  const _0x1a9f6b = normalizeText(_0x15754a);
  const _0x52e2d9 = normalizeText(_0xc45b14);
  if (_0x1a9f6b && _0x52e2d9) {
    return _0x1a9f6b + ":" + _0x52e2d9;
  } else {
    return "";
  }
}
export function normalizePersonReplacementIdentityCorrectionDrafts(_0x14bdbd = {}, _0x3c62ff = [], _0x2f642b = []) {
  const _0x2e091c = _0x14bdbd && typeof _0x14bdbd === "object" && !Array.isArray(_0x14bdbd) ? _0x14bdbd : {};
  const _0x1d1d44 = new Set((Array.isArray(_0x3c62ff) ? _0x3c62ff : []).flatMap(_0x4b3de8 => (Array.isArray(_0x4b3de8?.people) ? _0x4b3de8.people : []).map(_0x2bcfa1 => getPersonReplacementIdentityCorrectionDraftKey(_0x4b3de8.id, _0x2bcfa1.id))).filter(Boolean));
  const _0x40a23f = new Set([...(Array.isArray(_0x2f642b) ? _0x2f642b : []).map(_0x322e91 => normalizeText(_0x322e91?.id)), ...(Array.isArray(_0x3c62ff) ? _0x3c62ff : []).flatMap(_0x414060 => (Array.isArray(_0x414060?.people) ? _0x414060.people : []).map(_0x53bb09 => normalizeText(_0x53bb09?.sourceCharacterId)))].filter(Boolean));
  return Object.fromEntries(Object.entries(_0x2e091c).flatMap(([_0x287cbc, _0x5b27c5]) => {
    if (!_0x1d1d44.has(_0x287cbc) || !_0x5b27c5 || typeof _0x5b27c5 !== "object") {
      return [];
    }
    const _0x1c8aad = normalizeText(_0x5b27c5.label);
    const _0x3706a4 = normalizeText(_0x5b27c5.sourceCharacterId);
    const _0x3dbd66 = PERSON_REPLACEMENT_ORIENTATIONS.includes(normalizeText(_0x5b27c5.orientation)) && normalizeText(_0x5b27c5.orientation) !== "unknown" ? normalizeText(_0x5b27c5.orientation) : "";
    if (!_0x1c8aad && !_0x3dbd66 && !_0x40a23f.has(_0x3706a4)) {
      return [];
    }
    return [[_0x287cbc, {
      ...(_0x1c8aad ? {
        label: _0x1c8aad
      } : {}),
      ...(_0x40a23f.has(_0x3706a4) ? {
        sourceCharacterId: _0x3706a4
      } : {}),
      ...(_0x3dbd66 ? {
        orientation: _0x3dbd66
      } : {})
    }]];
  }));
}
export function getPersonReplacementReusableLabels(_0x10460b = {}) {
  const _0x2d09c1 = [];
  const _0x2b381d = new Set();
  const _0x3da91b = new Set(Array.isArray(_0x10460b.workspace?.removedCustomPersonLabels) ? _0x10460b.workspace.removedCustomPersonLabels.map(normalizeText).filter(Boolean) : []);
  (Array.isArray(_0x10460b.shots) ? _0x10460b.shots : []).forEach(_0x150ba => {
    (Array.isArray(_0x150ba?.people) ? _0x150ba.people : []).forEach(_0x8d107c => {
      const _0x4021d2 = normalizeText(_0x8d107c?.label);
      if (!_0x4021d2 || _0x3da91b.has(_0x4021d2) || _0x2b381d.has(_0x4021d2)) {
        return;
      }
      _0x2b381d.add(_0x4021d2);
      _0x2d09c1.push(_0x4021d2);
    });
  });
  return _0x2d09c1;
}
export function resolvePersonReplacementLabelSourceCharacterId(_0x484ea7 = {}, _0x3edc14 = "") {
  const _0xe8095 = normalizeText(_0x3edc14);
  if (!_0xe8095) {
    return "";
  }
  for (const _0x316683 of Array.isArray(_0x484ea7.shots) ? _0x484ea7.shots : []) {
    for (const _0x16281c of Array.isArray(_0x316683?.people) ? _0x316683.people : []) {
      if (normalizeText(_0x16281c?.label) !== _0xe8095) {
        continue;
      }
      const _0x47e6b6 = normalizeText(_0x16281c?.sourceCharacterId);
      if (_0x47e6b6) {
        return _0x47e6b6;
      }
    }
  }
  return normalizeText((Array.isArray(_0x484ea7.sourceCharacters) ? _0x484ea7.sourceCharacters : []).find(_0x17bfa3 => normalizeText(_0x17bfa3?.name) === _0xe8095)?.id);
}
export function getPersonReplacementLabelOptions({
  labels = [],
  selectedLabel = "",
  removedLabels = [],
  project = {}
} = {}) {
  const _0x21b2f4 = normalizeText(selectedLabel);
  const _0x2c17d3 = new Set((Array.isArray(removedLabels) ? removedLabels : []).map(normalizeText).filter(Boolean));
  const _0x3587c2 = [...new Set((Array.isArray(labels) ? labels : []).map(normalizeText).filter(Boolean))].filter(_0x2efee7 => !_0x2c17d3.has(_0x2efee7));
  if (_0x21b2f4 && !_0x2c17d3.has(_0x21b2f4) && !_0x3587c2.includes(_0x21b2f4)) {
    _0x3587c2.push(_0x21b2f4);
  }
  return [..._0x3587c2.map(_0xf27e7e => ({
    value: _0xf27e7e,
    label: _0xf27e7e,
    sourceCharacterId: resolvePersonReplacementLabelSourceCharacterId(project, _0xf27e7e),
    deletable: !isGeneratedPersonReplacementLabel(_0xf27e7e)
  })), {
    value: PERSON_REPLACEMENT_CUSTOM_LABEL_VALUE,
    label: "自定义"
  }];
}
export function getPersonReplacementBoxedPeople(_0xcdb63f = {}) {
  return (Array.isArray(_0xcdb63f?.people) ? _0xcdb63f.people : []).filter(_0x59a2e0 => getPersonReplacementBoundingBox(_0x59a2e0)).sort(comparePersonReplacementPeopleByPosition);
}
export function resolvePersonReplacementDetectionLabel(_0x4b27f7, _0x13f622, _0x30d44d, _0x56d8c5) {
  const _0x26d7a6 = getPersonReplacementIdentityCorrectionDraftKey(_0x56d8c5, _0x4b27f7?.id);
  const _0x18de86 = _0x30d44d?.workspace?.identityCorrectionDrafts?.[_0x26d7a6] || {};
  return normalizeText(_0x18de86.label) || normalizeText(_0x4b27f7?.label) || formatPersonReplacementPersonLabel(_0x13f622);
}
export function getPersonReplacementDuplicateRoleLabels(_0x5cdf0b = {}, _0x1811c8 = {}) {
  const _0x1e8718 = normalizeText(_0x5cdf0b?.id) || normalizeText(_0x1811c8?.workspace?.selectedShotId);
  const _0x98af0e = new Map();
  getPersonReplacementBoxedPeople(_0x5cdf0b).forEach((_0x1db413, _0x3e8541) => {
    const _0x4e4fee = resolvePersonReplacementDetectionLabel(_0x1db413, _0x3e8541, _0x1811c8, _0x1e8718);
    _0x98af0e.set(_0x4e4fee, (_0x98af0e.get(_0x4e4fee) || 0) + 1);
  });
  return [..._0x98af0e.entries()].filter(([, _0x288889]) => _0x288889 > 1).map(([_0x251adf]) => _0x251adf);
}
export function buildPersonReplacementSourceCharacters(_0x4c3a66, _0x78d322 = []) {
  const _0x4ebed0 = new Map((Array.isArray(_0x78d322) ? _0x78d322 : []).map(_0x1176d3 => [normalizeText(_0x1176d3?.id), _0x1176d3]).filter(([_0xf0d6b3]) => _0xf0d6b3));
  const _0x481f55 = new Map();
  (Array.isArray(_0x4c3a66) ? _0x4c3a66 : []).forEach(_0x1df57d => {
    (Array.isArray(_0x1df57d?.people) ? _0x1df57d.people : []).forEach(_0x2a025c => {
      const _0x3e024e = normalizeText(_0x2a025c?.sourceCharacterId);
      if (!_0x3e024e) {
        return;
      }
      const _0x2b6e4c = _0x4ebed0.get(_0x3e024e) || {};
      const _0xebc1fe = _0x481f55.get(_0x3e024e) || {
        id: _0x3e024e,
        name: normalizeText(_0x2b6e4c.name) || normalizeText(_0x2a025c.label) || "原人物" + (_0x481f55.size + 1),
        imageRefs: [],
        confidenceValues: [],
        reviewRequired: false,
        identityReviewStatus: "auto",
        memberCount: 0,
        exemplarShotId: normalizeText(_0x2b6e4c.exemplarShotId) || _0x1df57d.id,
        exemplarPersonId: normalizeText(_0x2b6e4c.exemplarPersonId) || _0x2a025c.id,
        ambiguousIdentityIds: new Set(_0x2b6e4c.ambiguousIdentityIds || []),
        notes: normalizeText(_0x2b6e4c.notes)
      };
      if (_0x1df57d.keyframeRef && !_0xebc1fe.imageRefs.includes(_0x1df57d.keyframeRef)) {
        _0xebc1fe.imageRefs.push(_0x1df57d.keyframeRef);
      }
      _0xebc1fe.memberCount += 1;
      _0xebc1fe.confidenceValues.push(Number(_0x2a025c.identityConfidence) || 0);
      (_0x2a025c.ambiguousIdentityIds || []).forEach(_0x4416ee => {
        if (_0x4416ee) {
          _0xebc1fe.ambiguousIdentityIds.add(_0x4416ee);
        }
      });
      if (_0x2a025c.identityReviewStatus === "needs_review" || _0x2a025c.identityReviewRequired === true) {
        _0xebc1fe.reviewRequired = true;
        _0xebc1fe.identityReviewStatus = "needs_review";
      } else if (_0xebc1fe.identityReviewStatus !== "needs_review" && (_0x2a025c.identityReviewStatus === "confirmed" || _0x2b6e4c.identityReviewStatus === "confirmed")) {
        _0xebc1fe.identityReviewStatus = "confirmed";
      }
      if (!_0xebc1fe.notes) {
        _0xebc1fe.notes = _0x2a025c.identityMethod === "osnet" ? "OSNet 跨镜头人物身份聚类" : _0x2a025c.identityMethod === "manual" ? "人工调整人物身份" : "自动检测人物身份";
      }
      _0x481f55.set(_0x3e024e, _0xebc1fe);
    });
  });
  return [..._0x481f55.values()].map(_0x60d9a4 => ({
    id: _0x60d9a4.id,
    name: _0x60d9a4.name,
    imageRefs: _0x60d9a4.imageRefs,
    confidence: _0x60d9a4.confidenceValues.length ? Math.min(..._0x60d9a4.confidenceValues) : 0,
    reviewRequired: _0x60d9a4.reviewRequired,
    identityReviewStatus: _0x60d9a4.identityReviewStatus,
    memberCount: _0x60d9a4.memberCount,
    exemplarShotId: _0x60d9a4.exemplarShotId,
    exemplarPersonId: _0x60d9a4.exemplarPersonId,
    ambiguousIdentityIds: [..._0x60d9a4.ambiguousIdentityIds],
    notes: _0x60d9a4.notes
  }));
}
export function normalizePersonReplacementBoundingBox(_0x1fcef1 = {}) {
  const _0x192f5d = Math.max(0, Math.min(1, Number(_0x1fcef1.x) || 0));
  const _0x1d87a1 = Math.max(0, Math.min(1, Number(_0x1fcef1.y) || 0));
  return {
    x: _0x192f5d,
    y: _0x1d87a1,
    width: Math.max(0, Math.min(1 - _0x192f5d, Number(_0x1fcef1.width) || 0)),
    height: Math.max(0, Math.min(1 - _0x1d87a1, Number(_0x1fcef1.height) || 0))
  };
}
export function orderAndRelabelPersonReplacementPeople(_0x12d147 = []) {
  return [..._0x12d147].sort(comparePersonReplacementPeopleByPosition).map((_0x1f04b9, _0x331c38) => ({
    ..._0x1f04b9,
    label: _0x1f04b9.identityMethod === "manual" && normalizeText(_0x1f04b9.label) ? normalizeText(_0x1f04b9.label) : formatPersonReplacementPersonLabel(_0x331c38)
  }));
}