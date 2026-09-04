import { STORY_ASSET_FOCUSED_MAX_OUTPUT_TOKENS } from "./storyAssetHybridBudget.js";
import { STORY_ASSET_COMPACT_RESPONSE_SCHEMA_VERSION, createStoryAssetPromptContracts } from "./storyAssetExtractionRequest.js";
const STORY_ASSET_DETAILED_DRAFT_STRATEGY = "kind-detailed-parallel-v1";
function cloneStoryAssetDetailedExtractionValue(_0x20a716) {
  if (!_0x20a716 || typeof _0x20a716 !== "object") {
    return null;
  }
  try {
    return JSON.parse(JSON.stringify(_0x20a716));
  } catch {
    return null;
  }
}
function classifyStoryAssetDetailedExtractionError(_0x5dc488, _0x2e2f0e) {
  const _0x3c7e86 = _0x2e2f0e(_0x5dc488?.message || _0x5dc488);
  const _0x47f79c = _0x2e2f0e(_0x5dc488?.type || _0x5dc488?.code).toUpperCase();
  if (_0x47f79c.includes("TIMEOUT") || /超时|timeout/iu.test(_0x3c7e86)) {
    return "timeout";
  }
  if (_0x47f79c.includes("DNS") || _0x47f79c.includes("ENOTFOUND") || _0x47f79c.includes("EAI_AGAIN") || /dns|name\s+resolution|getaddrinfo|域名解析/iu.test(_0x3c7e86)) {
    return "dns-error";
  }
  if (_0x47f79c.includes("NETWORK") || /fetch\s+failed|failed\s+to\s+fetch|network\s+(?:error|failure)|网络(?:错误|异常|失败)/iu.test(_0x3c7e86)) {
    return "network-error";
  }
  if (_0x47f79c.includes("ECONNRESET") || _0x47f79c.includes("ECONNABORTED") || _0x47f79c.includes("UND_ERR_SOCKET") || /connection\s*(?:reset|closed|aborted)|socket\s*hang\s*up|连接(?:被)?重置|连接中断/iu.test(_0x3c7e86)) {
    return "connection-reset";
  }
  if (_0x47f79c.includes("RATE") || /限流|rate.?limit|429/iu.test(_0x3c7e86)) {
    return "rate-limit";
  }
  if (/too\s+many\s+states|schema\s+(?:constraint|complexity)|constraint[^.]*schema/iu.test(_0x3c7e86)) {
    return "schema-complexity";
  }
  if (_0x47f79c.includes("LENGTH") || /截断|token|length/iu.test(_0x3c7e86)) {
    return "length";
  }
  if (_0x47f79c.includes("JSON") || /JSON|返回格式|没有可用/u.test(_0x3c7e86)) {
    return "invalid-json";
  }
  return "request-error";
}
function isStoryAssetConfirmedUnchargedRejection(_0xde086d) {
  const _0x4e71ef = Number(_0xde086d?.status ?? _0xde086d?.statusCode);
  return [400, 401, 403, 404, 409, 422, 429].includes(_0x4e71ef);
}
function isStoryAssetPaidRerunAuthorized(_0x43091f, _0x443ecd) {
  if (!_0x43091f || typeof _0x43091f !== "object") {
    return false;
  }
  const _0x288930 = Array.isArray(_0x43091f.authorizedKinds) ? _0x43091f.authorizedKinds : [];
  return _0x43091f.confirmed === true && _0x288930.includes(_0x443ecd);
}
function archiveStoryAssetPaidLane(_0x1888b7, _0x34a3fd, _0x20e10e) {
  const _0x13cb67 = _0x1888b7.paidResponseHistoryByKind && typeof _0x1888b7.paidResponseHistoryByKind === "object" ? _0x1888b7.paidResponseHistoryByKind : {};
  _0x1888b7.paidResponseHistoryByKind = _0x13cb67;
  const _0x5ae8bc = Array.isArray(_0x13cb67[_0x34a3fd]) ? _0x13cb67[_0x34a3fd] : [];
  _0x5ae8bc.push({
    archivedAt: Date.now(),
    reason: _0x20e10e,
    rawResponse: Object.hasOwn(_0x1888b7.rawResponsesByKind || {}, _0x34a3fd) ? _0x1888b7.rawResponsesByKind[_0x34a3fd] : "",
    responseMode: _0x1888b7.rawResponseModesByKind?.[_0x34a3fd] || "",
    contractSnapshot: cloneStoryAssetDetailedExtractionValue(_0x1888b7.rawResponseContractSnapshotsByKind?.[_0x34a3fd]),
    decisions: cloneStoryAssetDetailedExtractionValue(_0x1888b7.decisionsByKind?.[_0x34a3fd]),
    assets: cloneStoryAssetDetailedExtractionValue(_0x1888b7.assetsByKind?.[_0x34a3fd]) || [],
    submissionState: cloneStoryAssetDetailedExtractionValue(_0x1888b7.submissionStatesByKind?.[_0x34a3fd]),
    kindState: cloneStoryAssetDetailedExtractionValue(_0x1888b7.kindStates?.[_0x34a3fd])
  });
  _0x13cb67[_0x34a3fd] = _0x5ae8bc;
}
function clearStoryAssetPaidLane(_0x4b76d3, _0x33321f, _0x598adf) {
  archiveStoryAssetPaidLane(_0x4b76d3, _0x33321f, _0x598adf);
  _0x4b76d3.assetsByKind[_0x33321f] = [];
  delete _0x4b76d3.rawResponsesByKind[_0x33321f];
  delete _0x4b76d3.rawResponseModesByKind[_0x33321f];
  delete _0x4b76d3.rawResponseContractSnapshotsByKind[_0x33321f];
  delete _0x4b76d3.paidResponseReceivedByKind[_0x33321f];
  delete _0x4b76d3.decisionsByKind[_0x33321f];
  delete _0x4b76d3.submissionStatesByKind[_0x33321f];
}
function makeUniqueStoryAssetExtractionRef(_0x5155a7, _0x2885cd, _0x3a3931, _0x159118) {
  const _0x4bc6ef = _0x159118(_0x5155a7, _0x2885cd);
  if (!_0x3a3931.has(_0x4bc6ef)) {
    _0x3a3931.add(_0x4bc6ef);
    return _0x4bc6ef;
  }
  let _0x585174 = 2;
  let _0x40f1bc = _0x2885cd + "-" + _0x585174;
  while (_0x3a3931.has(_0x40f1bc)) {
    _0x585174 += 1;
    _0x40f1bc = _0x2885cd + "-" + _0x585174;
  }
  _0x3a3931.add(_0x40f1bc);
  return _0x40f1bc;
}
export function createParallelStoryAssetExtractor({
  schemaVersion: _0x46637e,
  assetKinds: _0x4df73d,
  generateText: _0x417871,
  normalizeText: _0x328ae7,
  getResultText: _0x24ba86,
  normalizeStoryProjectInput: _0xbbc6fd,
  normalizeAssetReference: _0x386b45,
  parseStoryAssetExtractionResult: _0x166881,
  parseStoryAssetCompactExtractionResult: _0x55cee1,
  extractStoryAssets: _0x3efae7
} = {}) {
  function _0x19587e(_0x275b6e) {
    const _0x4fc6db = JSON.stringify(_0x275b6e);
    let _0x17bdde = 2166136261;
    for (let _0x3af382 = 0; _0x3af382 < _0x4fc6db.length; _0x3af382 += 1) {
      _0x17bdde ^= _0x4fc6db.charCodeAt(_0x3af382);
      _0x17bdde = Math.imul(_0x17bdde, 16777619);
    }
    return _0x46637e + "-" + (_0x17bdde >>> 0).toString(16).padStart(8, "0") + "-" + _0x4fc6db.length;
  }
  function _0x1b26e4({
    project = {},
    aspectRatio = "",
    visualStyle = "",
    requiredAssetNamesByKind = null,
    compactOutput = false,
    compactOutputByKind = null
  } = {}) {
    const _0x4fd6dd = _0xbbc6fd(project);
    return _0x19587e({
      title: _0x4fd6dd.title,
      chapters: _0x4fd6dd.chapters,
      aspectRatio: _0x328ae7(aspectRatio) || _0x4fd6dd.aspectRatio,
      visualStyle: _0x328ae7(visualStyle) || _0x4fd6dd.visualStyle,
      extractionStrategy: STORY_ASSET_DETAILED_DRAFT_STRATEGY,
      extractionKinds: _0x4df73d,
      compactOutputByKind: compactOutputByKind && typeof compactOutputByKind === "object" ? compactOutputByKind : Object.fromEntries(_0x4df73d.map(_0x50adbd => [_0x50adbd, Boolean(compactOutput)])),
      ...(requiredAssetNamesByKind ? {
        requiredAssetNamesByKind: requiredAssetNamesByKind
      } : {})
    });
  }
  function _0x49922b(_0x36fa66, {
    requiredAssetNamesByKind = null,
    requiredAssetsByKind = null,
    candidateAssetsByKind = null,
    responseMode = "verbose"
  } = {}) {
    const _0x536557 = (_0x53824c = []) => (Array.isArray(_0x53824c) ? _0x53824c : []).map(_0x57a413 => ({
      name: _0x328ae7(_0x57a413 && typeof _0x57a413 === "object" ? _0x57a413.name : _0x57a413),
      sourceSceneRefs: Array.isArray(_0x57a413?.sourceSceneRefs) ? _0x57a413.sourceSceneRefs.map(_0x328ae7).filter(Boolean) : [],
      sourceChapterIds: Array.isArray(_0x57a413?.sourceChapterIds) ? _0x57a413.sourceChapterIds.map(_0x328ae7).filter(Boolean) : [],
      role: _0x328ae7(_0x57a413?.role),
      fixedTraits: _0x328ae7(_0x57a413?.fixedTraits)
    }));
    return _0x19587e({
      kind: _0x36fa66,
      responseMode: responseMode,
      ...(responseMode === "compact" ? {
        responseSchemaVersion: STORY_ASSET_COMPACT_RESPONSE_SCHEMA_VERSION
      } : {}),
      requiredNames: _0x536557(requiredAssetNamesByKind?.[_0x36fa66]),
      requiredContracts: _0x536557(requiredAssetsByKind?.[_0x36fa66]),
      candidateContracts: _0x536557(candidateAssetsByKind?.[_0x36fa66])
    });
  }
  function _0x121f2a(_0x210aa3, {
    requiredAssetNamesByKind = null,
    requiredAssetsByKind = null,
    candidateAssetsByKind = null,
    responseMode = "verbose"
  } = {}) {
    const _0x102edf = createStoryAssetPromptContracts([_0x210aa3], requiredAssetNamesByKind, candidateAssetsByKind, requiredAssetsByKind, {
      includeClientKeys: responseMode === "compact"
    }).payload;
    return {
      kind: _0x210aa3,
      responseMode: responseMode,
      responseSchemaVersion: responseMode === "compact" ? STORY_ASSET_COMPACT_RESPONSE_SCHEMA_VERSION : 1,
      requiredAssets: cloneStoryAssetDetailedExtractionValue(_0x102edf.requiredAssets || []) || [],
      candidateAssets: cloneStoryAssetDetailedExtractionValue(_0x102edf.candidateAssets || []) || []
    };
  }
  function _0x2da852(_0x3a0de3) {
    const _0x52fd8a = _0x24ba86(_0x3a0de3);
    if (typeof _0x52fd8a === "string") {
      return _0x52fd8a.trim();
    }
    try {
      return JSON.stringify(_0x52fd8a);
    } catch {
      return "";
    }
  }
  return async function _0x389cfd({
    project = {},
    model = "",
    provider = "",
    providerProfileId = "",
    aspectRatio = "",
    visualStyle = "",
    requiredAssetNamesByKind = null,
    requiredAssetsByKind = null,
    candidateAssetsByKind = null,
    resumeRequiredAssetNamesByKindAliases = [],
    resumeSourceAliases = [],
    resumeSourceFingerprintAliases = [],
    allowSavedPaidResultContractRevalidation = false,
    allowOversizedPrompt = true,
    automaticRecovery = false,
    structuredOutputFallback = "prompt",
    compactOutput = false,
    compactOutputByKind = null,
    maxOutputTokens = STORY_ASSET_FOCUSED_MAX_OUTPUT_TOKENS,
    request = _0x417871,
    onProgress = null,
    onCheckpoint = null,
    resumeDraft = null,
    paidRerunAuthorization = null
  } = {}) {
    const _0x4a600a = [..._0x4df73d];
    const _0x4f919c = {
      character: "角色",
      scene: "场景",
      prop: "道具"
    };
    const _0x4cd9ca = Object.fromEntries(_0x4a600a.map(_0x3961f8 => [_0x3961f8, compactOutputByKind && typeof compactOutputByKind === "object" ? compactOutputByKind[_0x3961f8] === "compact" : Boolean(compactOutput)]));
    const _0x466813 = Object.fromEntries(_0x4a600a.map(_0x22020b => [_0x22020b, _0x49922b(_0x22020b, {
      requiredAssetNamesByKind: requiredAssetNamesByKind,
      requiredAssetsByKind: requiredAssetsByKind,
      candidateAssetsByKind: candidateAssetsByKind,
      responseMode: _0x4cd9ca[_0x22020b] ? "compact" : "verbose"
    })]));
    const _0x24919b = Object.fromEntries(_0x4a600a.map(_0xf3cb6e => [_0xf3cb6e, _0x121f2a(_0xf3cb6e, {
      requiredAssetNamesByKind: requiredAssetNamesByKind,
      requiredAssetsByKind: requiredAssetsByKind,
      candidateAssetsByKind: candidateAssetsByKind,
      responseMode: _0x4cd9ca[_0xf3cb6e] ? "compact" : "verbose"
    })]));
    const _0x17d148 = _0xbbc6fd(project);
    const _0x215e52 = _0x17d148.chapters.map(_0x3aea0b => _0x3aea0b.id);
    const _0x3b11b8 = _0x1b26e4({
      project: project,
      aspectRatio: aspectRatio,
      visualStyle: visualStyle,
      requiredAssetNamesByKind: requiredAssetNamesByKind,
      compactOutput: compactOutput,
      compactOutputByKind: _0x4cd9ca
    });
    const _0x298748 = new Set([_0x3b11b8, ...(Array.isArray(resumeRequiredAssetNamesByKindAliases) ? resumeRequiredAssetNamesByKindAliases.map(_0x555210 => _0x1b26e4({
      project: project,
      aspectRatio: aspectRatio,
      visualStyle: visualStyle,
      requiredAssetNamesByKind: _0x555210,
      compactOutput: compactOutput,
      compactOutputByKind: _0x4cd9ca
    })) : []), ...(Array.isArray(resumeSourceAliases) ? resumeSourceAliases.map(_0x4adab3 => _0x1b26e4({
      project: _0x4adab3?.project || project,
      aspectRatio: aspectRatio,
      visualStyle: visualStyle,
      requiredAssetNamesByKind: _0x4adab3?.requiredAssetNamesByKind ?? requiredAssetNamesByKind,
      compactOutput: compactOutput,
      compactOutputByKind: _0x4cd9ca
    })) : []), ...(Array.isArray(resumeSourceFingerprintAliases) ? resumeSourceFingerprintAliases.map(_0x328ae7).filter(Boolean) : [])]);
    const _0x3775a4 = cloneStoryAssetDetailedExtractionValue(resumeDraft);
    const _0x5f4eef = _0x3775a4?.strategy === STORY_ASSET_DETAILED_DRAFT_STRATEGY;
    const _0x129f9e = _0x3775a4?.schemaVersion === _0x46637e;
    const _0xa47ca2 = _0x298748.has(_0x328ae7(_0x3775a4?.sourceFingerprint));
    const _0x5bff99 = _0x5f4eef && _0x129f9e && _0xa47ca2;
    const _0x40a3a1 = Boolean(_0x5f4eef && _0x4a600a.some(_0x4ba475 => _0x3775a4?.paidResponseReceivedByKind?.[_0x4ba475] || Object.hasOwn(_0x3775a4?.rawResponsesByKind || {}, _0x4ba475) || Math.max(0, Math.trunc(Number(_0x3775a4?.kindStates?.[_0x4ba475]?.requestCount) || 0)) > 0 || ["submitted", "ambiguous", "response-received", "blocked-paid-response", "blocked-ambiguous-submission", "blocked-incompatible", "validated"].includes(_0x328ae7(_0x3775a4?.submissionStatesByKind?.[_0x4ba475]?.status)) || Array.isArray(_0x3775a4?.assetsByKind?.[_0x4ba475]) && _0x3775a4.assetsByKind[_0x4ba475].length > 0));
    const _0x4bcded = Boolean(!_0x5bff99 && _0x40a3a1);
    const _0x293830 = Boolean(_0x4bcded && (!_0x129f9e || !_0xa47ca2));
    const _0x3c6a03 = Object.fromEntries(_0x4a600a.map(_0x5010c8 => [_0x5010c8, {
      kind: _0x5010c8,
      status: "pending",
      attempt: 0,
      requestCount: 0,
      repairCount: 0,
      assetCount: 0,
      errorType: "",
      errorMessage: "",
      startedAt: 0,
      finishedAt: 0
    }]));
    let _0x4ba511 = _0x5bff99 || _0x4bcded ? _0x3775a4 : {
      strategy: STORY_ASSET_DETAILED_DRAFT_STRATEGY,
      schemaVersion: _0x46637e,
      sourceFingerprint: _0x3b11b8,
      status: "pending",
      assetsByKind: Object.fromEntries(_0x4a600a.map(_0x34a286 => [_0x34a286, []])),
      rawResponsesByKind: {},
      rawResponseModesByKind: {},
      rawResponseContractSnapshotsByKind: {},
      paidResponseReceivedByKind: {},
      paidResponseHistoryByKind: {},
      submissionStatesByKind: {},
      decisionsByKind: {},
      contractFingerprintsByKind: _0x466813,
      contractSnapshotByKind: _0x24919b,
      kindStates: _0x3c6a03,
      completedKinds: [],
      completedAssets: [],
      failures: [],
      totalRequestCount: 0
    };
    _0x4ba511.strategy = STORY_ASSET_DETAILED_DRAFT_STRATEGY;
    if (!_0x293830) {
      _0x4ba511.schemaVersion = _0x46637e;
      _0x4ba511.sourceFingerprint = _0x3b11b8;
    }
    _0x4ba511.assetsByKind = _0x4ba511.assetsByKind && typeof _0x4ba511.assetsByKind === "object" ? _0x4ba511.assetsByKind : {};
    _0x4ba511.rawResponsesByKind = _0x4ba511.rawResponsesByKind && typeof _0x4ba511.rawResponsesByKind === "object" ? _0x4ba511.rawResponsesByKind : {};
    _0x4ba511.rawResponseModesByKind = _0x4ba511.rawResponseModesByKind && typeof _0x4ba511.rawResponseModesByKind === "object" ? _0x4ba511.rawResponseModesByKind : {};
    _0x4ba511.rawResponseContractSnapshotsByKind = _0x4ba511.rawResponseContractSnapshotsByKind && typeof _0x4ba511.rawResponseContractSnapshotsByKind === "object" ? _0x4ba511.rawResponseContractSnapshotsByKind : {};
    _0x4ba511.paidResponseReceivedByKind = _0x4ba511.paidResponseReceivedByKind && typeof _0x4ba511.paidResponseReceivedByKind === "object" ? _0x4ba511.paidResponseReceivedByKind : {};
    _0x4ba511.paidResponseHistoryByKind = _0x4ba511.paidResponseHistoryByKind && typeof _0x4ba511.paidResponseHistoryByKind === "object" ? _0x4ba511.paidResponseHistoryByKind : {};
    _0x4ba511.submissionStatesByKind = _0x4ba511.submissionStatesByKind && typeof _0x4ba511.submissionStatesByKind === "object" ? _0x4ba511.submissionStatesByKind : {};
    _0x4ba511.decisionsByKind = _0x4ba511.decisionsByKind && typeof _0x4ba511.decisionsByKind === "object" ? _0x4ba511.decisionsByKind : {};
    const _0x118672 = _0x4ba511.contractFingerprintsByKind && typeof _0x4ba511.contractFingerprintsByKind === "object" ? _0x4ba511.contractFingerprintsByKind : {};
    _0x4ba511.contractFingerprintsByKind = {
      ..._0x118672
    };
    _0x4ba511.contractSnapshotByKind = _0x4ba511.contractSnapshotByKind && typeof _0x4ba511.contractSnapshotByKind === "object" ? _0x4ba511.contractSnapshotByKind : {};
    _0x4ba511.requestedContractSnapshotByKind = cloneStoryAssetDetailedExtractionValue(_0x24919b);
    _0x4ba511.responseMode = new Set(Object.values(_0x4cd9ca)).size === 1 ? Object.values(_0x4cd9ca)[0] ? "compact" : "verbose" : "mixed";
    _0x4ba511.kindStates = _0x4ba511.kindStates && typeof _0x4ba511.kindStates === "object" ? _0x4ba511.kindStates : {};
    for (const _0x57ef32 of _0x4a600a) {
      if (!Array.isArray(_0x4ba511.assetsByKind[_0x57ef32])) {
        _0x4ba511.assetsByKind[_0x57ef32] = [];
      }
      const _0x29bf7d = _0x4ba511.kindStates[_0x57ef32] || {};
      const _0x22f579 = _0x328ae7(_0x118672[_0x57ef32]);
      const _0x45fcc9 = Boolean((_0x5bff99 || _0x4bcded) && _0x22f579 && _0x22f579 !== _0x466813[_0x57ef32]);
      const _0x56b1ec = Boolean((_0x5bff99 || _0x4bcded) && Object.hasOwn(_0x4ba511.rawResponsesByKind, _0x57ef32) && _0x328ae7(_0x4ba511.rawResponseModesByKind[_0x57ef32] || _0x29bf7d?.responseMode) === "compact" && !_0x4ba511.rawResponseContractSnapshotsByKind[_0x57ef32]);
      const _0x5b41d1 = Boolean(_0x4ba511.paidResponseReceivedByKind[_0x57ef32] || Object.hasOwn(_0x4ba511.rawResponsesByKind, _0x57ef32) || ["submitted", "ambiguous", "response-received", "blocked-paid-response", "blocked-ambiguous-submission", "blocked-incompatible", "validated"].includes(_0x328ae7(_0x4ba511.submissionStatesByKind[_0x57ef32]?.status)) || Math.max(0, Math.trunc(Number(_0x29bf7d?.requestCount) || 0)) > 0 || _0x4ba511.assetsByKind[_0x57ef32].length);
      const _0x5d0dc2 = isStoryAssetPaidRerunAuthorized(paidRerunAuthorization, _0x57ef32);
      let _0x4da897 = false;
      const _0x47440d = Boolean(_0x5b41d1 && _0x29bf7d?.status === "blocked-quality-rerun");
      const _0x2c86d2 = Boolean(_0x5b41d1 && !_0x47440d && (_0x293830 || _0x29bf7d?.status === "blocked-incompatible" || _0x45fcc9 && !allowSavedPaidResultContractRevalidation || _0x56b1ec));
      if ((_0x5bff99 || _0x4bcded) && _0x47440d && !_0x5d0dc2) {
        _0x4ba511.kindStates[_0x57ef32] = {
          ..._0x29bf7d,
          kind: _0x57ef32,
          status: "blocked-quality-rerun",
          errorType: "quality-rerun-required",
          errorMessage: "已付费结果未通过当前视觉质量合同；需要用户明确授权后才能重新请求。",
          responseMode: _0x4cd9ca[_0x57ef32] ? "compact" : "verbose"
        };
        continue;
      }
      if ((_0x5bff99 || _0x4bcded) && _0x47440d && _0x5d0dc2) {
        clearStoryAssetPaidLane(_0x4ba511, _0x57ef32, "authorized-quality-rerun");
        _0x4ba511.kindStates[_0x57ef32] = {
          ..._0x29bf7d,
          status: "pending",
          assetCount: 0,
          errorType: "",
          errorMessage: "",
          finishedAt: 0
        };
        _0x4da897 = true;
      }
      if ((_0x5bff99 || _0x4bcded) && _0x2c86d2 && !_0x5d0dc2) {
        _0x4ba511.kindStates[_0x57ef32] = {
          ..._0x29bf7d,
          kind: _0x57ef32,
          status: "blocked-incompatible",
          errorType: "contract-incompatible",
          errorMessage: _0x293830 ? "已付费结果的剧本来源或草稿版本与当前请求不兼容，需要用户明确授权后才能重新请求。" : _0x45fcc9 ? "已付费结果的资产合同版本与当前合同不兼容，需要用户明确授权后才能重新请求。" : "已付费紧凑结果缺少其原始合同快照，无法安全绑定，需要用户明确授权后才能重新请求。",
          responseMode: _0x4cd9ca[_0x57ef32] ? "compact" : "verbose"
        };
        continue;
      }
      if ((_0x5bff99 || _0x4bcded) && (_0x2c86d2 || !_0x5b41d1 && _0x293830 || _0x45fcc9 && !allowSavedPaidResultContractRevalidation || _0x56b1ec) && (_0x5d0dc2 || !_0x5b41d1)) {
        if (_0x5b41d1) {
          clearStoryAssetPaidLane(_0x4ba511, _0x57ef32, _0x293830 ? "authorized-source-or-schema-change-rerun" : _0x45fcc9 ? "authorized-contract-upgrade-rerun" : "authorized-missing-contract-snapshot-rerun");
        } else {
          _0x4ba511.assetsByKind[_0x57ef32] = [];
          delete _0x4ba511.rawResponsesByKind[_0x57ef32];
          delete _0x4ba511.rawResponseModesByKind[_0x57ef32];
          delete _0x4ba511.rawResponseContractSnapshotsByKind[_0x57ef32];
          delete _0x4ba511.paidResponseReceivedByKind[_0x57ef32];
          delete _0x4ba511.decisionsByKind[_0x57ef32];
          delete _0x4ba511.submissionStatesByKind[_0x57ef32];
        }
        _0x4ba511.kindStates[_0x57ef32] = {
          ..._0x29bf7d,
          status: "pending",
          assetCount: 0,
          errorType: "",
          errorMessage: "",
          finishedAt: 0
        };
        _0x4da897 = true;
      }
      const _0x103116 = _0x328ae7(_0x4ba511.submissionStatesByKind[_0x57ef32]?.status);
      const _0x3ac731 = _0x328ae7(_0x29bf7d?.errorType);
      const _0x4feb9 = !_0x4da897 && Boolean(_0x103116 === "submitted" || _0x103116 === "ambiguous" || _0x29bf7d?.status === "blocked-ambiguous-submission" || !_0x4ba511.rawResponsesByKind[_0x57ef32] && Math.max(0, Math.trunc(Number(_0x29bf7d?.requestCount) || 0)) > 0 && (_0x29bf7d?.status === "running" || _0x29bf7d?.status === "failed" && ["timeout", "connection-reset"].includes(_0x3ac731)));
      if ((_0x5bff99 || _0x4bcded) && _0x4feb9 && !_0x5d0dc2) {
        _0x4ba511.kindStates[_0x57ef32] = {
          ..._0x29bf7d,
          kind: _0x57ef32,
          status: "blocked-ambiguous-submission",
          errorType: "ambiguous-submission",
          errorMessage: "请求已提交但未确认是否计费成功；需要用户明确授权后才能重新请求。",
          responseMode: _0x4cd9ca[_0x57ef32] ? "compact" : "verbose",
          finishedAt: Number(_0x29bf7d?.finishedAt) || Date.now()
        };
        continue;
      }
      if ((_0x5bff99 || _0x4bcded) && _0x4feb9 && _0x5d0dc2) {
        clearStoryAssetPaidLane(_0x4ba511, _0x57ef32, "authorized-ambiguous-submission-rerun");
        _0x4ba511.kindStates[_0x57ef32] = {
          ..._0x29bf7d,
          status: "pending",
          assetCount: 0,
          errorType: "",
          errorMessage: "",
          finishedAt: 0
        };
      }
      _0x4ba511.contractFingerprintsByKind[_0x57ef32] = _0x466813[_0x57ef32];
      _0x4ba511.contractSnapshotByKind[_0x57ef32] = cloneStoryAssetDetailedExtractionValue(_0x24919b[_0x57ef32]);
      _0x4ba511.kindStates[_0x57ef32] = {
        ..._0x3c6a03[_0x57ef32],
        ...(_0x4ba511.kindStates[_0x57ef32] || {}),
        kind: _0x57ef32,
        responseMode: _0x4cd9ca[_0x57ef32] ? "compact" : "verbose"
      };
    }
    _0x4ba511.schemaVersion = _0x46637e;
    _0x4ba511.sourceFingerprint = _0x3b11b8;
    let _0x5f4cd3 = Promise.resolve();
    const _0x98c312 = async (_0x456482 = "") => {
      _0x4ba511.completedKinds = _0x4a600a.filter(_0x195b34 => _0x4ba511.kindStates[_0x195b34]?.status === "succeeded");
      _0x4ba511.completedAssets = _0x4a600a.flatMap(_0x5d86db => _0x4ba511.assetsByKind[_0x5d86db] || []);
      _0x4ba511.failures = _0x4a600a.flatMap(_0x1cab9a => {
        const _0xaaa84d = _0x4ba511.kindStates[_0x1cab9a];
        if (_0xaaa84d?.status === "failed" || String(_0xaaa84d?.status || "").startsWith("blocked-")) {
          return [{
            stage: "kind",
            kind: _0x1cab9a,
            errorType: _0x328ae7(_0xaaa84d.errorType),
            errorMessage: _0x328ae7(_0xaaa84d.errorMessage)
          }];
        } else {
          return [];
        }
      });
      _0x4ba511.progress = {
        stage: "kind",
        current: _0x4ba511.completedKinds.length,
        total: _0x4a600a.length,
        message: _0x456482
      };
      _0x4ba511.updatedAt = Date.now();
      const _0x3622df = cloneStoryAssetDetailedExtractionValue(_0x4ba511);
      if (typeof onCheckpoint === "function") {
        _0x5f4cd3 = _0x5f4cd3.then(() => onCheckpoint(_0x3622df));
        await _0x5f4cd3;
      }
      onProgress?.({
        stage: "extracting-assets-parallel",
        current: _0x4ba511.completedKinds.length,
        total: _0x4a600a.length,
        message: _0x456482
      });
    };
    const _0x3d5b88 = async (_0x3ae816, _0x15ca1e, _0x569eed) => {
      _0x4ba511.status = "blocked";
      await _0x98c312(_0x569eed);
      const _0x3599a8 = new Error(_0x569eed);
      _0x3599a8.type = _0x15ca1e;
      _0x3599a8.blockedKinds = [..._0x3ae816];
      _0x3599a8.assetExtractionDraft = cloneStoryAssetDetailedExtractionValue(_0x4ba511);
      throw _0x3599a8;
    };
    onProgress?.({
      stage: "extracting-assets-parallel",
      current: _0x4a600a.filter(_0x387b9d => _0x4ba511.kindStates[_0x387b9d]?.status === "succeeded").length,
      total: _0x4a600a.length,
      message: "正在并行提取角色、场景与道具"
    });
    const _0x5398dc = _0x4a600a.filter(_0x29d738 => _0x4ba511.kindStates[_0x29d738]?.status === "blocked-quality-rerun");
    if (_0x5398dc.length) {
      await _0x3d5b88(_0x5398dc, "ASSET_VISUAL_QUALITY_RERUN_REQUIRED", "已付费的" + _0x5398dc.map(_0x280e5d => _0x4f919c[_0x280e5d]).join("、") + "结果未通过视觉质量合同；未自动重新请求。");
    }
    const _0x39caba = _0x4a600a.filter(_0x132441 => _0x4ba511.kindStates[_0x132441]?.status === "blocked-incompatible");
    if (_0x39caba.length) {
      await _0x3d5b88(_0x39caba, "ASSET_CONTRACT_INCOMPATIBLE", "已付费的" + _0x39caba.map(_0x54952a => _0x4f919c[_0x54952a]).join("、") + "结果与当前合同不兼容；未自动重新请求。");
    }
    const _0x23163d = _0x4a600a.filter(_0x1436f0 => _0x4ba511.kindStates[_0x1436f0]?.status === "blocked-ambiguous-submission");
    if (_0x23163d.length) {
      await _0x3d5b88(_0x23163d, "ASSET_SUBMISSION_AMBIGUOUS", _0x23163d.map(_0x3b395c => _0x4f919c[_0x3b395c]).join("、") + "请求的计费状态不明确；未自动重新请求。");
    }
    _0x4ba511.status = "in-progress";
    await _0x98c312("正在并行提取角色、场景与道具");
    for (const _0x25e13e of _0x4a600a) {
      if (_0x4ba511.kindStates[_0x25e13e]?.status === "succeeded") {
        continue;
      }
      const _0x43d19e = _0x328ae7(_0x4ba511.rawResponsesByKind[_0x25e13e]);
      if (!_0x43d19e) {
        if (_0x4ba511.paidResponseReceivedByKind[_0x25e13e] && !isStoryAssetPaidRerunAuthorized(paidRerunAuthorization, _0x25e13e)) {
          _0x4ba511.kindStates[_0x25e13e] = {
            ..._0x4ba511.kindStates[_0x25e13e],
            status: "blocked-paid-response",
            assetCount: 0,
            errorType: "paid-result-validation",
            errorMessage: "已付费请求返回空内容；已停止自动重新请求。",
            finishedAt: Date.now()
          };
        } else if (_0x4ba511.paidResponseReceivedByKind[_0x25e13e] && isStoryAssetPaidRerunAuthorized(paidRerunAuthorization, _0x25e13e)) {
          clearStoryAssetPaidLane(_0x4ba511, _0x25e13e, "authorized-empty-paid-response-rerun");
          _0x4ba511.kindStates[_0x25e13e] = {
            ..._0x4ba511.kindStates[_0x25e13e],
            status: "pending",
            assetCount: 0,
            errorType: "",
            errorMessage: "",
            finishedAt: 0
          };
        }
        continue;
      }
      try {
        const _0x62d053 = _0x328ae7(_0x4ba511.rawResponseModesByKind[_0x25e13e] || _0x4ba511.kindStates[_0x25e13e]?.responseMode || _0x4ba511.responseMode);
        const _0x45a8cd = _0x62d053 === "compact" ? _0x55cee1(_0x43d19e, {
          assetKinds: [_0x25e13e],
          chapterIds: _0x215e52,
          contractSnapshot: _0x4ba511.rawResponseContractSnapshotsByKind[_0x25e13e]
        }) : _0x166881(_0x43d19e, {
          chapterIds: _0x215e52,
          allowedKinds: [_0x25e13e],
          allowEmptyResult: Array.isArray(requiredAssetNamesByKind?.[_0x25e13e]) && requiredAssetNamesByKind[_0x25e13e].length === 0
        });
        _0x4ba511.assetsByKind[_0x25e13e] = _0x45a8cd.assets;
        if (Array.isArray(_0x45a8cd?.decisions)) {
          _0x4ba511.decisionsByKind[_0x25e13e] = cloneStoryAssetDetailedExtractionValue(_0x45a8cd.decisions);
        }
        _0x4ba511.contractFingerprintsByKind[_0x25e13e] = _0x466813[_0x25e13e];
        _0x4ba511.contractSnapshotByKind[_0x25e13e] = cloneStoryAssetDetailedExtractionValue(_0x24919b[_0x25e13e]);
        _0x4ba511.kindStates[_0x25e13e] = {
          ..._0x4ba511.kindStates[_0x25e13e],
          status: "succeeded",
          assetCount: _0x45a8cd.assets.length,
          errorType: "",
          errorMessage: "",
          finishedAt: Date.now()
        };
        _0x4ba511.submissionStatesByKind[_0x25e13e] = {
          ..._0x4ba511.submissionStatesByKind[_0x25e13e],
          status: "validated",
          validatedAt: Date.now()
        };
        await _0x98c312(_0x4f919c[_0x25e13e] + "已从上次付费结果恢复：" + _0x45a8cd.assets.length + " 个");
      } catch (_0x3a6959) {
        if (isStoryAssetPaidRerunAuthorized(paidRerunAuthorization, _0x25e13e)) {
          clearStoryAssetPaidLane(_0x4ba511, _0x25e13e, "authorized-invalid-paid-response-rerun");
          _0x4ba511.kindStates[_0x25e13e] = {
            ..._0x4ba511.kindStates[_0x25e13e],
            status: "pending",
            assetCount: 0,
            errorType: "",
            errorMessage: "",
            finishedAt: 0
          };
          continue;
        }
        _0x4ba511.kindStates[_0x25e13e] = {
          ..._0x4ba511.kindStates[_0x25e13e],
          status: "blocked-paid-response",
          assetCount: 0,
          errorType: "paid-result-validation",
          errorMessage: _0x328ae7(_0x3a6959?.message || _0x3a6959),
          finishedAt: Date.now()
        };
      }
    }
    const _0x9a816d = _0x4a600a.filter(_0x3ccad4 => _0x4ba511.kindStates[_0x3ccad4]?.status === "blocked-paid-response");
    if (_0x9a816d.length) {
      await _0x3d5b88(_0x9a816d, "ASSET_PAID_RESULT_BLOCKED", "已付费的" + _0x9a816d.map(_0x58d286 => _0x4f919c[_0x58d286]).join("、") + "结果未通过合同校验；已保留原始返回且未自动重新请求。");
    }
    const _0x5335d5 = _0x4a600a.filter(_0x33a02c => _0x4ba511.kindStates[_0x33a02c]?.status !== "succeeded");
    const _0x9cf035 = await Promise.allSettled(_0x5335d5.map(async _0x3d17c0 => {
      const _0x32a5ac = _0x4cd9ca[_0x3d17c0] && Array.isArray(requiredAssetNamesByKind?.[_0x3d17c0]) && requiredAssetNamesByKind[_0x3d17c0].length === 0 && (!Array.isArray(candidateAssetsByKind?.[_0x3d17c0]) || candidateAssetsByKind[_0x3d17c0].length === 0);
      if (_0x32a5ac) {
        _0x4ba511.assetsByKind[_0x3d17c0] = [];
        _0x4ba511.kindStates[_0x3d17c0] = {
          ..._0x4ba511.kindStates[_0x3d17c0],
          status: "succeeded",
          assetCount: 0,
          errorType: "",
          errorMessage: "",
          finishedAt: Date.now()
        };
        await _0x98c312(_0x4f919c[_0x3d17c0] + "无待提取资产，已在本地完成");
        return {
          schemaVersion: _0x46637e,
          assets: []
        };
      }
      const _0x511eb4 = _0x4cd9ca[_0x3d17c0];
      const _0x57aa79 = Date.now();
      _0x4ba511.kindStates[_0x3d17c0] = {
        ..._0x4ba511.kindStates[_0x3d17c0],
        status: "running",
        attempt: Math.max(0, Math.trunc(Number(_0x4ba511.kindStates[_0x3d17c0]?.attempt) || 0)) + 1,
        assetCount: 0,
        errorType: "",
        errorMessage: "",
        startedAt: _0x57aa79,
        finishedAt: 0
      };
      await _0x98c312("正在提取" + _0x4f919c[_0x3d17c0] + "；已完成 " + _0x4ba511.completedKinds.length + "/" + _0x4a600a.length);
      let _0x5f2801 = 0;
      try {
        const _0x41c0f7 = await _0x3efae7({
          project: project,
          model: model,
          provider: provider,
          providerProfileId: providerProfileId,
          aspectRatio: aspectRatio,
          visualStyle: visualStyle,
          assetKinds: [_0x3d17c0],
          requiredAssetNamesByKind: requiredAssetNamesByKind,
          requiredAssetsByKind: requiredAssetsByKind,
          candidateAssetsByKind: candidateAssetsByKind,
          compactOutput: _0x511eb4,
          allowOversizedPrompt: allowOversizedPrompt,
          automaticRecovery: automaticRecovery,
          structuredOutputFallback: structuredOutputFallback,
          maxOutputTokens: maxOutputTokens,
          onProgress: ({
            stage: _0x81fde4,
            message: _0x4dedaa
          } = {}) => {
            onProgress?.({
              stage: _0x328ae7(_0x81fde4) || "extracting-assets-parallel",
              current: _0x4ba511.completedKinds.length,
              total: _0x4a600a.length,
              message: _0x328ae7(_0x4dedaa)
            });
          },
          request: async _0x13f272 => {
            _0x5f2801 += 1;
            _0x4ba511.totalRequestCount = Math.max(0, Math.trunc(Number(_0x4ba511.totalRequestCount) || 0)) + 1;
            _0x4ba511.kindStates[_0x3d17c0].requestCount = Math.max(0, Math.trunc(Number(_0x4ba511.kindStates[_0x3d17c0]?.requestCount) || 0)) + 1;
            if (_0x5f2801 > 1) {
              _0x4ba511.kindStates[_0x3d17c0].repairCount = Math.max(0, Math.trunc(Number(_0x4ba511.kindStates[_0x3d17c0]?.repairCount) || 0)) + 1;
            }
            _0x4ba511.submissionStatesByKind[_0x3d17c0] = {
              status: "submitted",
              submittedAt: Date.now(),
              requestCount: _0x4ba511.kindStates[_0x3d17c0].requestCount,
              responseMode: _0x511eb4 ? "compact" : "verbose",
              contractSnapshot: cloneStoryAssetDetailedExtractionValue(_0x24919b[_0x3d17c0])
            };
            await _0x98c312(_0x5f2801 > 1 ? "正在提交" + _0x4f919c[_0x3d17c0] + "自动纠错请求（1/1）" : "正在提交" + _0x4f919c[_0x3d17c0] + "提取请求");
            const _0x1820de = await request(_0x13f272);
            const _0x4be222 = _0x2da852(_0x1820de);
            _0x4ba511.paidResponseReceivedByKind[_0x3d17c0] = true;
            _0x4ba511.rawResponsesByKind[_0x3d17c0] = _0x4be222;
            _0x4ba511.rawResponseModesByKind[_0x3d17c0] = _0x511eb4 ? "compact" : "verbose";
            _0x4ba511.rawResponseContractSnapshotsByKind[_0x3d17c0] = cloneStoryAssetDetailedExtractionValue(_0x24919b[_0x3d17c0]);
            _0x4ba511.submissionStatesByKind[_0x3d17c0] = {
              ..._0x4ba511.submissionStatesByKind[_0x3d17c0],
              status: "response-received",
              responseReceivedAt: Date.now()
            };
            if (!_0x4be222) {
              _0x4ba511.kindStates[_0x3d17c0] = {
                ..._0x4ba511.kindStates[_0x3d17c0],
                status: "blocked-paid-response",
                assetCount: 0,
                errorType: "empty-paid-response",
                errorMessage: "已付费请求返回空内容；已停止自动重新请求。",
                finishedAt: Date.now()
              };
              _0x4ba511.submissionStatesByKind[_0x3d17c0] = {
                ..._0x4ba511.submissionStatesByKind[_0x3d17c0],
                status: "blocked-paid-response",
                blockedAt: Date.now(),
                errorType: "empty-paid-response"
              };
              await _0x98c312(_0x4f919c[_0x3d17c0] + "付费请求返回空内容；已阻断且未自动重试");
              const _0xf6e656 = new Error(_0x4f919c[_0x3d17c0] + "付费请求返回空内容；需要明确授权后才能重新请求。");
              _0xf6e656.type = "ASSET_PAID_RESULT_BLOCKED";
              throw _0xf6e656;
            }
            await _0x98c312(_0x4f919c[_0x3d17c0] + "请求已完成，正在校验付费结果");
            return _0x1820de;
          }
        });
        _0x4ba511.assetsByKind[_0x3d17c0] = _0x41c0f7.assets;
        if (Array.isArray(_0x41c0f7?.decisions)) {
          _0x4ba511.decisionsByKind[_0x3d17c0] = cloneStoryAssetDetailedExtractionValue(_0x41c0f7.decisions);
        } else {
          delete _0x4ba511.decisionsByKind[_0x3d17c0];
        }
        _0x4ba511.contractFingerprintsByKind[_0x3d17c0] = _0x466813[_0x3d17c0];
        _0x4ba511.contractSnapshotByKind[_0x3d17c0] = cloneStoryAssetDetailedExtractionValue(_0x24919b[_0x3d17c0]);
        _0x4ba511.kindStates[_0x3d17c0] = {
          ..._0x4ba511.kindStates[_0x3d17c0],
          status: "succeeded",
          assetCount: _0x41c0f7.assets.length,
          errorType: "",
          errorMessage: "",
          finishedAt: Date.now()
        };
        _0x4ba511.submissionStatesByKind[_0x3d17c0] = {
          ..._0x4ba511.submissionStatesByKind[_0x3d17c0],
          status: "validated",
          validatedAt: Date.now()
        };
        await _0x98c312(_0x4f919c[_0x3d17c0] + "完成：" + _0x41c0f7.assets.length + " 个");
        return _0x41c0f7;
      } catch (_0x29a2dd) {
        const _0x1c657a = _0x328ae7(_0x4ba511.submissionStatesByKind[_0x3d17c0]?.status);
        const _0x18439c = _0x1c657a === "response-received";
        const _0x517c18 = Boolean(_0x29a2dd?.type === "ASSET_PAID_RESULT_BLOCKED" || _0x1c657a === "blocked-paid-response");
        const _0x10b190 = classifyStoryAssetDetailedExtractionError(_0x29a2dd, _0x328ae7);
        const _0x3e04cb = Boolean(!_0x18439c && !_0x517c18 && _0x5f2801 > 0 && isStoryAssetConfirmedUnchargedRejection(_0x29a2dd));
        const _0x38e9a6 = Boolean(!_0x18439c && !_0x517c18 && _0x5f2801 > 0 && !_0x3e04cb);
        if (_0x5f2801 > 0 && !_0x18439c && !_0x517c18) {
          _0x4ba511.submissionStatesByKind[_0x3d17c0] = {
            ..._0x4ba511.submissionStatesByKind[_0x3d17c0],
            status: _0x38e9a6 ? "ambiguous" : "rejected-confirmed",
            failedAt: Date.now(),
            errorType: _0x10b190,
            errorMessage: _0x328ae7(_0x29a2dd?.message || _0x29a2dd)
          };
        }
        _0x4ba511.kindStates[_0x3d17c0] = {
          ..._0x4ba511.kindStates[_0x3d17c0],
          status: _0x18439c || _0x517c18 ? "blocked-paid-response" : _0x38e9a6 ? "blocked-ambiguous-submission" : "failed",
          assetCount: 0,
          errorType: _0x517c18 ? _0x328ae7(_0x4ba511.kindStates[_0x3d17c0]?.errorType) || "paid-result-validation" : _0x18439c ? "paid-result-validation" : _0x38e9a6 ? "ambiguous-submission" : _0x10b190,
          errorMessage: _0x328ae7(_0x29a2dd?.message || _0x29a2dd),
          finishedAt: Date.now()
        };
        await _0x98c312(_0x4f919c[_0x3d17c0] + "提取失败；已保留其他付费结果");
        throw _0x29a2dd;
      }
    }));
    const _0x5b0d63 = _0x9cf035.findIndex(_0x456e6f => _0x456e6f.status === "rejected");
    if (_0x5b0d63 >= 0) {
      const _0x51e7a8 = _0x4a600a.filter(_0x1e575e => _0x4ba511.kindStates[_0x1e575e]?.status === "blocked-paid-response");
      const _0x385796 = _0x4a600a.filter(_0x2d0705 => _0x4ba511.kindStates[_0x2d0705]?.status === "blocked-ambiguous-submission");
      const _0x265a14 = [..._0x51e7a8, ..._0x385796];
      _0x4ba511.status = _0x265a14.length ? "blocked" : _0x4ba511.completedKinds.length ? "partial" : "failed";
      await _0x98c312(_0x265a14.length ? _0x265a14.map(_0x51438f => _0x4f919c[_0x51438f]).join("、") + "已进入付费保护状态；未自动重新请求" : "已保留 " + _0x4ba511.completedKinds.length + "/" + _0x4a600a.length + " 路付费结果；仅需重试失败项");
      const _0x37ff5d = _0x9cf035[_0x5b0d63].reason;
      const _0x97e00c = _0x5335d5[_0x5b0d63];
      const _0x5b1684 = new Error(_0x4f919c[_0x97e00c] + "提取失败：" + (_0x328ae7(_0x37ff5d?.message) || "模型请求失败"));
      if (_0x51e7a8.length) {
        _0x5b1684.type = "ASSET_PAID_RESULT_BLOCKED";
        _0x5b1684.blockedKinds = _0x51e7a8;
      } else if (_0x385796.length) {
        _0x5b1684.type = "ASSET_SUBMISSION_AMBIGUOUS";
        _0x5b1684.blockedKinds = _0x385796;
      }
      _0x5b1684.cause = _0x37ff5d;
      _0x5b1684.assetExtractionDraft = cloneStoryAssetDetailedExtractionValue(_0x4ba511);
      throw _0x5b1684;
    }
    const _0x198720 = new Set();
    const _0x158c9c = new Set();
    const _0x53de1e = _0x4a600a.flatMap(_0x5832d6 => (_0x4ba511.assetsByKind[_0x5832d6] || []).map((_0x261d9e, _0x5f361a) => {
      const _0x275133 = makeUniqueStoryAssetExtractionRef(_0x261d9e.ref, _0x5832d6 + "-" + (_0x5f361a + 1), _0x198720, _0x386b45);
      return {
        ..._0x261d9e,
        ref: _0x275133,
        appearances: _0x261d9e.appearances.map((_0x595d63, _0x2e359b) => ({
          ..._0x595d63,
          ref: makeUniqueStoryAssetExtractionRef(_0x595d63.ref, _0x275133 + "-appearance-" + (_0x2e359b + 1), _0x158c9c, _0x386b45)
        }))
      };
    }));
    _0x4ba511.status = "completed";
    await _0x98c312("资产提取完成：" + _0x53de1e.length + " 个");
    return {
      schemaVersion: _0x46637e,
      extractionStrategy: "kind-detailed-parallel",
      assets: _0x53de1e
    };
  };
}