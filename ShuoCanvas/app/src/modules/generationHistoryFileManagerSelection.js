export function isActionableFileManagerMediaKind(_0x13594a) {
  const _0x53ec00 = String(_0x13594a || "").trim().toLowerCase();
  return _0x53ec00 === "image" || _0x53ec00 === "video" || _0x53ec00 === "audio";
}
export function buildFileManagerHistoryRecordKey({
  projectId = "",
  canvasId = "",
  resultFingerprint = ""
} = {}) {
  return [String(projectId || "").trim(), String(canvasId || "").trim(), String(resultFingerprint || "").trim()].join(":");
}
export function buildFileManagerHistoryMediaKey({
  projectId = "",
  canvasId = "",
  mediaKind = "",
  localPath = "",
  resultFingerprint = ""
} = {}) {
  const _0x3ed340 = String(localPath || "").trim();
  if (_0x3ed340) {
    return ["media", String(projectId || "").trim(), String(canvasId || "").trim(), String(mediaKind || "").trim().toLowerCase(), _0x3ed340].join(":");
  }
  if (!String(resultFingerprint || "").trim()) {
    return "";
  }
  return "fingerprint:" + buildFileManagerHistoryRecordKey({
    projectId: projectId,
    canvasId: canvasId,
    resultFingerprint: resultFingerprint
  });
}
export function buildFileManagerHistoryEntryKey({
  projectId = "",
  canvasId = "",
  generationRunId = "",
  mediaKind = "",
  sourceIndex = 0,
  localPath = "",
  resultFingerprint = ""
} = {}) {
  const _0x3255e5 = String(generationRunId || "").trim();
  if (_0x3255e5) {
    return ["generation", String(projectId || "").trim(), String(canvasId || "").trim(), _0x3255e5, String(mediaKind || "").trim().toLowerCase(), Math.max(0, Math.trunc(Number(sourceIndex) || 0))].join(":");
  }
  return buildFileManagerHistoryMediaKey({
    projectId: projectId,
    canvasId: canvasId,
    mediaKind: mediaKind,
    localPath: localPath,
    resultFingerprint: resultFingerprint
  });
}
function defaultHistoryLocalPath(_0x478a6c) {
  const _0xee02c8 = Array.isArray(_0x478a6c?.nodes) ? _0x478a6c.nodes[0] : null;
  return String(_0x478a6c?.localPath || _0xee02c8?.originalLocalPath || _0xee02c8?.localPath || _0xee02c8?.displayLocalPath || _0xee02c8?.imageUrl || _0xee02c8?.videoUrl || _0xee02c8?.audioUrl || _0xee02c8?.src || "").trim();
}
export function isFileManagerHistoryBackfillRecord(_0x4a6135) {
  const _0x1eefbc = String(_0x4a6135?.historyCaptureSource || "").trim();
  if (_0x1eefbc) {
    return _0x1eefbc === "backfill";
  }
  if (!String(_0x4a6135?.generationRunId || "").trim()) {
    return false;
  }
  const _0x451137 = Number(_0x4a6135?.generationStartedAt || 0);
  const _0x13326f = Number(_0x4a6135?.createdAt || 0);
  const _0x1d438e = Math.max(0, Math.trunc(Number(_0x4a6135?.sourceIndex) || 0));
  return Number.isFinite(_0x451137) && _0x451137 > 0 && Number.isFinite(_0x13326f) && _0x13326f === _0x451137 + _0x1d438e;
}
function buildFileManagerBackfillMatchKey(_0x20adc9, {
  getMediaKind = _0x34247e => _0x34247e?.mediaKind,
  getLocalPath = defaultHistoryLocalPath
} = {}) {
  const _0x28dd97 = String(_0x20adc9?.sourceNodeId || "").trim();
  if (!_0x28dd97) {
    return "";
  }
  const _0x10737a = buildFileManagerHistoryMediaKey({
    projectId: _0x20adc9?.projectId,
    canvasId: _0x20adc9?.canvasId,
    mediaKind: getMediaKind(_0x20adc9),
    localPath: getLocalPath(_0x20adc9),
    resultFingerprint: _0x20adc9?.resultFingerprint
  });
  if (!_0x10737a) {
    return "";
  }
  return [_0x28dd97, Math.max(0, Math.trunc(Number(_0x20adc9?.sourceIndex) || 0)), _0x10737a].join(":");
}
export function isFileManagerBackfillDuplicate(_0x4c6e8d, _0x5bd2c6, {
  getMediaKind = _0xc0b6bd => _0xc0b6bd?.mediaKind,
  getLocalPath = defaultHistoryLocalPath
} = {}) {
  if (!isFileManagerHistoryBackfillRecord(_0x5bd2c6)) {
    return false;
  }
  const _0x40e989 = buildFileManagerBackfillMatchKey(_0x5bd2c6, {
    getMediaKind: getMediaKind,
    getLocalPath: getLocalPath
  });
  return Boolean(_0x40e989 && _0x40e989 === buildFileManagerBackfillMatchKey(_0x4c6e8d, {
    getMediaKind: getMediaKind,
    getLocalPath: getLocalPath
  }));
}
export function resolveFileManagerBackfillStartedAt(_0x2d4e06) {
  for (const _0x46693 of [_0x2d4e06?.generationStartTime, _0x2d4e06?.rhTaskStartedAt, _0x2d4e06?.dreaminaTaskStartedAt, _0x2d4e06?.asyncTaskStartedAt, _0x2d4e06?.createdAt]) {
    const _0x5cfc02 = Number(_0x46693);
    if (Number.isFinite(_0x5cfc02) && _0x5cfc02 > 0) {
      return Math.trunc(_0x5cfc02);
    }
  }
  const _0x4571d9 = String(_0x2d4e06?.id || "").match(/\d{13}/g) || [];
  const _0x5d5247 = Number(_0x4571d9[_0x4571d9.length - 1] || 0);
  if (Number.isFinite(_0x5d5247) && _0x5d5247 > 0) {
    return Math.trunc(_0x5d5247);
  } else {
    return 1;
  }
}
export function dedupeFileManagerHistoryRecords(_0x3479dc, {
  getMediaKind = _0x2eb535 => _0x2eb535?.mediaKind,
  getLocalPath = defaultHistoryLocalPath
} = {}) {
  const _0x596efd = [...(Array.isArray(_0x3479dc) ? _0x3479dc : [])].sort((_0x1d4620, _0x4e9693) => {
    const _0x8234bf = Number(_0x1d4620?.updatedAt || _0x1d4620?.createdAt || 0);
    const _0x150cc8 = Number(_0x4e9693?.updatedAt || _0x4e9693?.createdAt || 0);
    return _0x150cc8 - _0x8234bf;
  });
  const _0x330dd2 = _0x596efd.filter(_0x45e036 => !isFileManagerHistoryBackfillRecord(_0x45e036));
  const _0x53729f = new Set();
  const _0x1da2f9 = new Set();
  const _0x2950cf = [];
  for (const _0x4749fb of _0x596efd) {
    if (isFileManagerHistoryBackfillRecord(_0x4749fb)) {
      if (_0x330dd2.some(_0x20674e => isFileManagerBackfillDuplicate(_0x20674e, _0x4749fb, {
        getMediaKind: getMediaKind,
        getLocalPath: getLocalPath
      }))) {
        continue;
      }
      const _0x38f8e4 = buildFileManagerBackfillMatchKey(_0x4749fb, {
        getMediaKind: getMediaKind,
        getLocalPath: getLocalPath
      });
      if (_0x38f8e4 && _0x53729f.has(_0x38f8e4)) {
        continue;
      }
      if (_0x38f8e4) {
        _0x53729f.add(_0x38f8e4);
      }
    }
    const _0x51a25a = buildFileManagerHistoryEntryKey({
      projectId: _0x4749fb?.projectId,
      canvasId: _0x4749fb?.canvasId,
      generationRunId: _0x4749fb?.generationRunId,
      mediaKind: getMediaKind(_0x4749fb),
      sourceIndex: _0x4749fb?.sourceIndex,
      localPath: getLocalPath(_0x4749fb),
      resultFingerprint: _0x4749fb?.resultFingerprint
    });
    if (_0x51a25a && _0x1da2f9.has(_0x51a25a)) {
      continue;
    }
    if (_0x51a25a) {
      _0x1da2f9.add(_0x51a25a);
    }
    _0x2950cf.push(_0x4749fb);
  }
  return _0x2950cf;
}
export function isFileManagerHistoryRecordVisible({
  record: _0x3885de,
  source = "history",
  projectId = "",
  canvasId = "",
  activeFilter = "all",
  getMediaKind = _0x2bb08b => _0x2bb08b?.mediaKind
} = {}) {
  const _0x3e68a3 = String(projectId || "").trim();
  const _0x33f78f = String(canvasId || "").trim();
  if (_0x3e68a3 && String(_0x3885de?.projectId || "").trim() !== _0x3e68a3) {
    return false;
  }
  if (source === "current-canvas" && _0x33f78f && String(_0x3885de?.canvasId || "").trim() !== _0x33f78f) {
    return false;
  }
  const _0x527ca5 = String(activeFilter || "all").trim();
  return _0x527ca5 === "all" || String(getMediaKind(_0x3885de) || "").trim() === _0x527ca5;
}
export function getFileManagerSelectionAfterClick({
  current = [],
  recordId = "",
  shiftKey = false,
  actionable = true
} = {}) {
  const _0x266667 = String(recordId || "");
  const _0x261bfd = new Set((Array.isArray(current) ? current : []).map(_0x2a9f37 => String(_0x2a9f37 || "")));
  if (!_0x266667 || !actionable) {
    return Array.from(_0x261bfd);
  }
  if (shiftKey) {
    if (_0x261bfd.has(_0x266667)) {
      _0x261bfd.delete(_0x266667);
    } else {
      _0x261bfd.add(_0x266667);
    }
    return Array.from(_0x261bfd);
  }
  return [_0x266667];
}
export function getFileManagerMenuActions({
  records = [],
  canRevealInFolder = false,
  getMediaKind = _0x382769 => _0x382769?.mediaKind,
  isActionableRecord = _0x2a0fd6 => isActionableFileManagerMediaKind(getMediaKind(_0x2a0fd6))
} = {}) {
  const _0x333218 = (Array.isArray(records) ? records : []).filter(isActionableRecord);
  if (_0x333218.length === 0) {
    return [];
  }
  const _0x453444 = ["add-to-canvas"];
  if (_0x333218.length === 1) {
    const _0x22cad3 = String(getMediaKind(_0x333218[0]) || "").trim().toLowerCase();
    if (_0x22cad3 === "image" || _0x22cad3 === "video") {
      _0x453444.push("fullscreen");
    }
    if (canRevealInFolder) {
      _0x453444.push("reveal");
    }
  }
  _0x453444.push("delete");
  return _0x453444;
}