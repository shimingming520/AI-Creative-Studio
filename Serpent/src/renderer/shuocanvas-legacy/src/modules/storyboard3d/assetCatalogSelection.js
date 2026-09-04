export const STORYBOARD_3D_AI_ASSET_CANDIDATE_LIMIT = 100;
const MIN_CANDIDATE_LIMIT = 20;
const MAX_CANDIDATE_LIMIT = 120;
function normalizeText(_0x2948ce) {
  return String(_0x2948ce || "").normalize("NFKC").trim().toLocaleLowerCase();
}
function createSearchTokens(_0x424623) {
  const _0x1ce1bf = normalizeText(_0x424623);
  const _0x2d0eb5 = new Set(_0x1ce1bf.match(/[a-z0-9]+/g) || []);
  for (const _0x119ccc of _0x1ce1bf.match(/[\p{Script=Han}]+/gu) || []) {
    if (_0x119ccc.length <= 4) {
      _0x2d0eb5.add(_0x119ccc);
    }
    for (const _0xfe3041 of [2, 3, 4]) {
      for (let _0x16eeeb = 0; _0x16eeeb <= _0x119ccc.length - _0xfe3041; _0x16eeeb += 1) {
        _0x2d0eb5.add(_0x119ccc.slice(_0x16eeeb, _0x16eeeb + _0xfe3041));
      }
    }
  }
  return _0x2d0eb5;
}
function normalizeAssetFields(_0x31cf2f = {}) {
  const _0x397375 = [...(Array.isArray(_0x31cf2f.tags) ? _0x31cf2f.tags : []), ...(Array.isArray(_0x31cf2f.keywords) ? _0x31cf2f.keywords : [])].map(normalizeText).filter(Boolean);
  return {
    id: normalizeText(_0x31cf2f.id || _0x31cf2f.familyId),
    name: normalizeText(_0x31cf2f.name),
    category: normalizeText(_0x31cf2f.category),
    tags: _0x397375,
    familyId: normalizeText(_0x31cf2f.familyId || _0x31cf2f.source?.familyId)
  };
}
function countTokenMatches(_0x4d35ee, _0x5bfdfd) {
  if (!_0x5bfdfd) {
    return 0;
  }
  const _0x3118d9 = createSearchTokens(_0x5bfdfd);
  let _0x448ffe = 0;
  _0x3118d9.forEach(_0x3b5aa7 => {
    if (_0x4d35ee.has(_0x3b5aa7)) {
      _0x448ffe += 1;
    }
  });
  return _0x448ffe;
}
function scoreAsset(_0x90968d, _0x410250, _0x5c12bf) {
  const _0x428dd3 = normalizeAssetFields(_0x90968d);
  let _0x36b339 = 0;
  if (_0x410250 && _0x428dd3.name === _0x410250) {
    _0x36b339 += 240;
  }
  if (_0x410250.length >= 2 && _0x428dd3.name.includes(_0x410250)) {
    _0x36b339 += 160;
  }
  if (_0x428dd3.name.length >= 2 && _0x410250.includes(_0x428dd3.name)) {
    _0x36b339 += 120;
  }
  if (_0x410250.length >= 2 && _0x428dd3.tags.some(_0x397bcd => _0x397bcd.includes(_0x410250))) {
    _0x36b339 += 140;
  }
  _0x36b339 += countTokenMatches(_0x5c12bf, _0x428dd3.name) * 28;
  _0x36b339 += _0x428dd3.tags.reduce((_0x4e5a09, _0x1d7c72) => _0x4e5a09 + countTokenMatches(_0x5c12bf, _0x1d7c72) * 22, 0);
  _0x36b339 += countTokenMatches(_0x5c12bf, _0x428dd3.category) * 10;
  _0x36b339 += countTokenMatches(_0x5c12bf, _0x428dd3.familyId) * 8;
  _0x36b339 += countTokenMatches(_0x5c12bf, _0x428dd3.id) * 6;
  return _0x36b339;
}
function interleaveFallbackAssets(_0x4a7f77) {
  const _0x141d7a = new Map();
  _0x4a7f77.forEach(_0x1972b4 => {
    const _0x2168ec = normalizeAssetFields(_0x1972b4.asset);
    const _0x4813ba = _0x2168ec.category || normalizeText(_0x1972b4.asset?.sourcePack || _0x1972b4.asset?.source?.packId) || "other";
    if (!_0x141d7a.has(_0x4813ba)) {
      _0x141d7a.set(_0x4813ba, []);
    }
    _0x141d7a.get(_0x4813ba).push(_0x1972b4);
  });
  const _0x5cba01 = [..._0x141d7a.values()];
  const _0x3d9603 = [];
  while (_0x5cba01.length > 0) {
    for (let _0x423405 = _0x5cba01.length - 1; _0x423405 >= 0; _0x423405 -= 1) {
      const _0x2896ec = _0x5cba01[_0x423405].shift();
      if (_0x2896ec) {
        _0x3d9603.push(_0x2896ec);
      }
      if (_0x5cba01[_0x423405].length === 0) {
        _0x5cba01.splice(_0x423405, 1);
      }
    }
  }
  return _0x3d9603;
}
export function selectRelevantStoryboard3DAssets(_0x6f0372 = [], _0xca6477 = "", {
  limit = STORYBOARD_3D_AI_ASSET_CANDIDATE_LIMIT
} = {}) {
  const _0x1948af = normalizeText(_0xca6477);
  const _0x19295b = createSearchTokens(_0x1948af);
  const _0x3bb910 = Math.max(MIN_CANDIDATE_LIMIT, Math.min(MAX_CANDIDATE_LIMIT, Math.floor(Number(limit) || STORYBOARD_3D_AI_ASSET_CANDIDATE_LIMIT)));
  const _0x329cff = new Set();
  const _0x3e2dd7 = (Array.isArray(_0x6f0372) ? _0x6f0372 : []).map((_0x548bd8, _0x4f3f5f) => ({
    asset: _0x548bd8,
    index: _0x4f3f5f,
    key: normalizeText(_0x548bd8?.id || _0x548bd8?.familyId),
    score: scoreAsset(_0x548bd8, _0x1948af, _0x19295b)
  })).filter(_0x42d3b9 => {
    if (!_0x42d3b9.key || _0x329cff.has(_0x42d3b9.key)) {
      return false;
    }
    _0x329cff.add(_0x42d3b9.key);
    return true;
  });
  if (_0x3e2dd7.length <= _0x3bb910) {
    return _0x3e2dd7.map(_0x5d0d58 => _0x5d0d58.asset);
  }
  const _0x4ae308 = _0x3e2dd7.filter(_0x1d6458 => _0x1d6458.score > 0).sort((_0x3a50cd, _0x1e4076) => _0x1e4076.score - _0x3a50cd.score || _0x3a50cd.index - _0x1e4076.index);
  const _0x25a8ca = interleaveFallbackAssets(_0x3e2dd7.filter(_0x14aea9 => _0x14aea9.score <= 0));
  return [..._0x4ae308, ..._0x25a8ca].slice(0, _0x3bb910).map(_0x248b12 => _0x248b12.asset);
}