const RUN_KIND = "story-episode-split-run";
const RUN_VERSION = 1;
const MAX_INVOCATIONS = 32;
const MAX_RAW_RESPONSE_CHARACTERS = 160000;
let sequence = 0;
function normalizeText(_0x49ae7f) {
  return String(_0x49ae7f || "").trim();
}
function cloneJson(_0x392aa2) {
  if (_0x392aa2 == null) {
    return _0x392aa2;
  }
  return JSON.parse(JSON.stringify(_0x392aa2));
}
function stableSerialize(_0x595343) {
  if (Array.isArray(_0x595343)) {
    return "[" + _0x595343.map(stableSerialize).join(",") + "]";
  }
  if (_0x595343 && typeof _0x595343 === "object") {
    return "{" + Object.keys(_0x595343).sort().map(_0x31e35f => JSON.stringify(_0x31e35f) + ":" + stableSerialize(_0x595343[_0x31e35f])).join(",") + "}";
  }
  return JSON.stringify(_0x595343 ?? null);
}
function fingerprint(_0x191c30) {
  const _0x54d6aa = stableSerialize(_0x191c30);
  let _0x46dad7 = 2166136261;
  for (let _0x5261b6 = 0; _0x5261b6 < _0x54d6aa.length; _0x5261b6 += 1) {
    _0x46dad7 ^= _0x54d6aa.charCodeAt(_0x5261b6);
    _0x46dad7 = Math.imul(_0x46dad7, 16777619);
  }
  return "fnv1a-" + (_0x46dad7 >>> 0).toString(16).padStart(8, "0");
}
function normalizeExecution(_0x432792 = {}) {
  return {
    modelId: normalizeText(_0x432792.modelId),
    provider: normalizeText(_0x432792.provider),
    providerProfileId: normalizeText(_0x432792.providerProfileId)
  };
}
function createInput({
  project = {},
  episode = {},
  assets = [],
  constraints = {},
  execution = {},
  mode = "standard",
  promptExperiment = false
} = {}) {
  return {
    projectId: normalizeText(project.id),
    episodeId: normalizeText(episode.id),
    episodeRef: normalizeText(episode.ref || episode.planningRef || episode.id),
    mode: normalizeText(mode) || "standard",
    promptExperiment: promptExperiment === true,
    promptMode: normalizeText(constraints?.promptMode),
    sourceFingerprint: fingerprint({
      scriptMode: project.scriptMode,
      summaryRevision: project.summaryRevision,
      outlineRevision: project.outlineSourceSummaryRevision,
      episode: {
        title: episode.title,
        synopsis: episode.synopsis,
        hook: episode.hook,
        script: episode.script?.fullText,
        scenes: episode.script?.scenes
      },
      assets: (Array.isArray(assets) ? assets : []).map(_0x353081 => ({
        id: _0x353081?.id,
        ref: _0x353081?.ref,
        name: _0x353081?.name,
        kind: _0x353081?.kind,
        appearances: _0x353081?.appearances
      })),
      constraints: constraints
    }),
    execution: normalizeExecution(execution),
    promptVersion: mode === "experimental" ? "episode-split-experimental/v3" : "episode-split/v2",
    schemaVersion: "story-episode-split/v2"
  };
}
function normalizeInvocation(_0x1c2902 = {}) {
  return {
    id: normalizeText(_0x1c2902.id),
    stepId: normalizeText(_0x1c2902.stepId),
    attempt: Math.max(1, Math.trunc(Number(_0x1c2902.attempt) || 1)),
    state: normalizeText(_0x1c2902.state),
    requestFingerprint: normalizeText(_0x1c2902.requestFingerprint),
    rawResponse: String(_0x1c2902.rawResponse || "").slice(0, MAX_RAW_RESPONSE_CHARACTERS),
    error: normalizeText(_0x1c2902.error),
    preparedAt: Math.max(0, Number(_0x1c2902.preparedAt || 0)),
    completedAt: Math.max(0, Number(_0x1c2902.completedAt || 0)),
    retryAuthorizedAt: Math.max(0, Number(_0x1c2902.retryAuthorizedAt || 0))
  };
}
export function normalizeStoryEpisodeSplitRun(_0x459907) {
  const _0x32f2ee = _0x459907?.kind === RUN_KIND && _0x459907?.run ? _0x459907.run : _0x459907;
  if (!_0x32f2ee || typeof _0x32f2ee !== "object" || Array.isArray(_0x32f2ee) || _0x32f2ee.kind !== RUN_KIND || Number(_0x32f2ee.version) !== RUN_VERSION) {
    return null;
  }
  return {
    kind: RUN_KIND,
    version: RUN_VERSION,
    id: normalizeText(_0x32f2ee.id),
    status: normalizeText(_0x32f2ee.status) || "running",
    inputFingerprint: normalizeText(_0x32f2ee.inputFingerprint),
    input: cloneJson(_0x32f2ee.input || {}),
    checkpoint: cloneJson(_0x32f2ee.checkpoint || null),
    checkpointAt: Math.max(0, Number(_0x32f2ee.checkpointAt || 0)),
    qualityReview: cloneJson(_0x32f2ee.qualityReview || null),
    invocations: (Array.isArray(_0x32f2ee.invocations) ? _0x32f2ee.invocations : []).map(normalizeInvocation).filter(_0x4486fd => _0x4486fd.id && _0x4486fd.stepId).slice(-MAX_INVOCATIONS),
    candidateArtifact: cloneJson(_0x32f2ee.candidateArtifact || null),
    error: normalizeText(_0x32f2ee.error),
    createdAt: Math.max(0, Number(_0x32f2ee.createdAt || 0)) || Date.now(),
    updatedAt: Math.max(0, Number(_0x32f2ee.updatedAt || 0)) || Date.now()
  };
}
function createRun(_0x12dd85) {
  const _0x4c6192 = createInput(_0x12dd85);
  const _0x707e12 = Date.now();
  sequence += 1;
  return {
    kind: RUN_KIND,
    version: RUN_VERSION,
    id: "episode-split:" + (_0x4c6192.projectId || "project") + ":" + (_0x4c6192.episodeId || _0x4c6192.episodeRef) + ":" + _0x707e12 + ":" + sequence,
    status: "running",
    inputFingerprint: fingerprint(_0x4c6192),
    input: _0x4c6192,
    checkpoint: null,
    checkpointAt: 0,
    qualityReview: null,
    invocations: [],
    candidateArtifact: null,
    error: "",
    createdAt: _0x707e12,
    updatedAt: _0x707e12
  };
}
function isResumable(_0x7ffba6, _0x461142) {
  if (!_0x7ffba6 || !["running", "failed_retryable", "ready_to_commit"].includes(_0x7ffba6.status)) {
    return false;
  }
  const _0x4e1f73 = _0x7ffba6.status === "ready_to_commit" && _0x7ffba6.candidateArtifact;
  return _0x7ffba6.inputFingerprint === fingerprint(createInput({
    ..._0x461142,
    ...(_0x4e1f73 ? {
      execution: _0x7ffba6.input.execution
    } : {})
  }));
}
function hasUncommittedPaidCall(_0x5819ea) {
  if (_0x5819ea.status === "ready_to_commit" && _0x5819ea.candidateArtifact) {
    return false;
  }
  return _0x5819ea.invocations.some(_0x56b652 => {
    if (_0x56b652.retryAuthorizedAt) {
      return false;
    }
    if (["prepared", "outcome-unknown"].includes(_0x56b652.state)) {
      return true;
    }
    return _0x56b652.state === "completed" && _0x56b652.completedAt > _0x5819ea.checkpointAt;
  });
}
export function createStoryEpisodeSplitRunRecorder({
  resumePayload = null,
  onChange = null,
  ..._0x32caf6
} = {}) {
  const _0x3d5919 = normalizeStoryEpisodeSplitRun(resumePayload);
  let _0x12ef57 = isResumable(_0x3d5919, _0x32caf6) ? _0x3d5919 : createRun(_0x32caf6);
  const _0x250c6c = async () => {
    _0x12ef57.updatedAt = Date.now();
    await onChange?.(cloneJson(_0x12ef57));
  };
  const _0x4f005a = () => ({
    kind: RUN_KIND,
    run: cloneJson(_0x12ef57)
  });
  return Object.freeze({
    get execution() {
      return cloneJson(_0x12ef57.input.execution);
    },
    get checkpoint() {
      return cloneJson(_0x12ef57.checkpoint);
    },
    get candidateArtifact() {
      if (_0x12ef57.status === "ready_to_commit") {
        return cloneJson(_0x12ef57.candidateArtifact);
      } else {
        return null;
      }
    },
    get qualityReview() {
      return cloneJson(_0x12ef57.qualityReview);
    },
    get requiresPaidRetry() {
      return hasUncommittedPaidCall(_0x12ef57);
    },
    payload: _0x4f005a,
    async start() {
      if (_0x12ef57.status !== "ready_to_commit" || !_0x12ef57.candidateArtifact) {
        _0x12ef57.status = "running";
        _0x12ef57.error = "";
      }
      await _0x250c6c();
    },
    async authorizePaidRetry() {
      const _0x2694cf = Date.now();
      _0x12ef57.invocations = _0x12ef57.invocations.map(_0x22333e => !_0x22333e.retryAuthorizedAt && (["prepared", "outcome-unknown"].includes(_0x22333e.state) || _0x22333e.state === "completed" && _0x22333e.completedAt > _0x12ef57.checkpointAt) ? {
        ..._0x22333e,
        retryAuthorizedAt: _0x2694cf
      } : _0x22333e);
      await _0x250c6c();
    },
    async onInvocation(_0x4ffe53 = {}) {
      const _0x49b26b = Date.now();
      if (_0x4ffe53.state === "prepared") {
        sequence += 1;
        _0x12ef57.invocations.push(normalizeInvocation({
          id: _0x12ef57.id + ":" + normalizeText(_0x4ffe53.stepId) + ":" + _0x4ffe53.attempt + ":" + sequence,
          stepId: _0x4ffe53.stepId,
          attempt: _0x4ffe53.attempt,
          state: "prepared",
          requestFingerprint: fingerprint({
            model: _0x4ffe53.requestPayload?.model,
            provider: _0x4ffe53.requestPayload?.provider,
            prompt: _0x4ffe53.requestPayload?.prompt
          }),
          preparedAt: _0x49b26b
        }));
      } else {
        const _0xf44155 = [..._0x12ef57.invocations].reverse().find(_0x53629a => _0x53629a.stepId === normalizeText(_0x4ffe53.stepId) && _0x53629a.attempt === Math.max(1, Math.trunc(Number(_0x4ffe53.attempt) || 1)) && _0x53629a.state === "prepared");
        if (_0xf44155) {
          _0xf44155.state = normalizeText(_0x4ffe53.state);
          _0xf44155.rawResponse = String(_0x4ffe53.rawResponse || "").slice(0, MAX_RAW_RESPONSE_CHARACTERS);
          _0xf44155.error = normalizeText(_0x4ffe53.error);
          _0xf44155.completedAt = _0x49b26b;
        }
      }
      _0x12ef57.invocations = _0x12ef57.invocations.slice(-MAX_INVOCATIONS);
      await _0x250c6c();
    },
    async saveCheckpoint(_0xb58deb) {
      _0x12ef57.checkpoint = cloneJson(_0xb58deb || null);
      _0x12ef57.checkpointAt = Date.now();
      await _0x250c6c();
    },
    async saveQualityReview(_0x5a1a98) {
      _0x12ef57.qualityReview = cloneJson(_0x5a1a98 || null);
      _0x12ef57.checkpointAt = Date.now();
      await _0x250c6c();
    },
    async ready(_0x5db75e) {
      _0x12ef57.status = "ready_to_commit";
      _0x12ef57.candidateArtifact = cloneJson(_0x5db75e);
      _0x12ef57.checkpointAt = Date.now();
      await _0x250c6c();
    },
    async failed(_0x19137d) {
      _0x12ef57.status = "failed_retryable";
      _0x12ef57.error = normalizeText(_0x19137d?.message || _0x19137d);
      const _0x1e4c77 = _0x19137d?.experimentalDraft || _0x19137d?.partialResult;
      if (_0x1e4c77) {
        _0x12ef57.checkpoint = cloneJson(_0x1e4c77);
        _0x12ef57.checkpointAt = Date.now();
      }
      await _0x250c6c();
    },
    async succeeded() {
      _0x12ef57.status = "succeeded";
      _0x12ef57.candidateArtifact = null;
      _0x12ef57.checkpoint = null;
      _0x12ef57.qualityReview = null;
      _0x12ef57.checkpointAt = Date.now();
      _0x12ef57.error = "";
      await _0x250c6c();
    }
  });
}