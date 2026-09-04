export const PERSON_REPLACEMENT_LIBRARY_SCHEMA_VERSION = 2;
function normalizeText(_0x3344d2) {
  return String(_0x3344d2 ?? "").trim();
}
function cloneJson(_0x220f58) {
  if (!_0x220f58 || typeof _0x220f58 !== "object") {
    return _0x220f58;
  }
  return JSON.parse(JSON.stringify(_0x220f58));
}
const RUNTIME_PROJECT_FIELDS = new Set(["libraryProjects", "libraryAssets", "sourcePreviewRefs"]);
function stripRuntimeProjectFields(_0x437456) {
  if (!_0x437456 || typeof _0x437456 !== "object" || Array.isArray(_0x437456)) {
    return _0x437456;
  }
  return Object.fromEntries(Object.entries(_0x437456).filter(([_0x3a75c3]) => !RUNTIME_PROJECT_FIELDS.has(_0x3a75c3)));
}
function getProjectId(_0xb1a6f2) {
  return normalizeText(_0xb1a6f2?.id || _0xb1a6f2?.project?.id);
}
function getProjectUpdatedTime(_0x42e0bc) {
  const _0x23069b = _0x42e0bc?.updatedAt || _0x42e0bc?.project?.updatedAt;
  const _0x499ff5 = Date.parse(_0x23069b || "");
  if (Number.isFinite(_0x499ff5)) {
    return _0x499ff5;
  } else {
    return 0;
  }
}
function normalizeProjectEntry(_0x37d4b7) {
  if (!_0x37d4b7 || typeof _0x37d4b7 !== "object" || Array.isArray(_0x37d4b7)) {
    return null;
  }
  const _0x382927 = getProjectId(_0x37d4b7);
  if (!_0x382927) {
    return null;
  }
  return {
    ...cloneJson(stripRuntimeProjectFields(_0x37d4b7)),
    id: _0x382927
  };
}
function collectPersistedProjects(_0xbd414a) {
  if (!_0xbd414a || typeof _0xbd414a !== "object") {
    return [];
  }
  if (Array.isArray(_0xbd414a.projects)) {
    return _0xbd414a.projects;
  }
  const _0xc5956a = _0xbd414a.project || _0xbd414a.currentProject || _0xbd414a.data;
  if (_0xc5956a && typeof _0xc5956a === "object") {
    return [_0xc5956a];
  }
  if (getProjectId(_0xbd414a)) {
    return [_0xbd414a];
  } else {
    return [];
  }
}
export function normalizePersonReplacementProjectLibrary(_0x331fcb = {}) {
  const _0x20064e = new Map();
  collectPersistedProjects(_0x331fcb).forEach(_0x2bf3c6 => {
    const _0x2d5fce = normalizeProjectEntry(_0x2bf3c6);
    if (!_0x2d5fce) {
      return;
    }
    const _0x20c56a = _0x20064e.get(_0x2d5fce.id);
    if (!_0x20c56a || getProjectUpdatedTime(_0x2d5fce) >= getProjectUpdatedTime(_0x20c56a)) {
      _0x20064e.set(_0x2d5fce.id, _0x2d5fce);
    }
  });
  const _0x31871a = [..._0x20064e.values()].sort((_0x216597, _0x174e21) => getProjectUpdatedTime(_0x174e21) - getProjectUpdatedTime(_0x216597));
  const _0x154ed7 = normalizeText(_0x331fcb?.currentProjectId || _0x331fcb?.project?.id || _0x331fcb?.currentProject?.id);
  const _0x522342 = _0x31871a.some(_0x1bb878 => _0x1bb878.id === _0x154ed7) ? _0x154ed7 : _0x31871a[0]?.id || "";
  return {
    schemaVersion: PERSON_REPLACEMENT_LIBRARY_SCHEMA_VERSION,
    currentProjectId: _0x522342,
    projects: _0x31871a
  };
}
export function upsertPersonReplacementProject(_0x4c7577, _0x8bea24) {
  const _0x534aa2 = normalizePersonReplacementProjectLibrary(_0x4c7577);
  const _0xff4ab0 = normalizeProjectEntry(_0x8bea24);
  if (!_0xff4ab0) {
    return _0x534aa2;
  }
  return normalizePersonReplacementProjectLibrary({
    ..._0x534aa2,
    currentProjectId: _0xff4ab0.id,
    projects: [_0xff4ab0, ..._0x534aa2.projects.filter(_0x38255d => _0x38255d.id !== _0xff4ab0.id)]
  });
}
export function removePersonReplacementProject(_0x379b98, _0x13383a) {
  const _0x4f555a = normalizePersonReplacementProjectLibrary(_0x379b98);
  const _0x4b27b2 = normalizeText(_0x13383a);
  return normalizePersonReplacementProjectLibrary({
    ..._0x4f555a,
    currentProjectId: _0x4f555a.currentProjectId === _0x4b27b2 ? "" : _0x4f555a.currentProjectId,
    projects: _0x4f555a.projects.filter(_0xd70348 => _0xd70348.id !== _0x4b27b2)
  });
}