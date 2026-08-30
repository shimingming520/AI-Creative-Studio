import { PERSON_REPLACEMENT_DEFAULT_IMAGE_MODEL_ID, PERSON_REPLACEMENT_DEFAULT_VIDEO_MODEL_ID, PERSON_REPLACEMENT_VIDEO_INPUT_MODE_FIRST_FRAME, createPersonReplacementProject, confirmPersonReplacementSourceCharacter, formatPersonReplacementPersonLabel, getPersonReplacementVideoResults, getPersonReplacementCharacterBaseImageRef, mergePersonReplacementSourceCharacters, normalizePersonReplacementOrientation, normalizePersonReplacementScope, splitPersonReplacementSourceCharacter } from "./personReplacementProject.js";
import { resolvePersonReplacementVideoSlotState } from "./personReplacementVideoInputs.js";
import { applyPersonReplacementCharacterAssetPromptPreset, createPersonReplacementImageGenerationMappingRevision, createPersonReplacementImagePromptRequestResolver, resolveGeneratedPersonReplacementAppearanceName as a1098_0x475bca } from "./personReplacementImageGeneration.js";
import { createPersonReplacementImageTaskRuntime } from "./personReplacementImageTaskRuntime.js";
import { updatePersonReplacementVideoGenerationState } from "./personReplacementVideoGeneration.js";
import { runPersonReplacementSmartClip } from "./personReplacementSmartClipService.js";
import { createReplacementStudioWorkspace } from "./personReplacementWorkspace.js";
import { createReplacementStudioProjectSession, normalizeReplacementStudioApplicationProject, settleInterruptedReplacementStudioProjectTasks } from "./personReplacementProjectSession.js";
import { PERSON_REPLACEMENT_STEP_GATE_REASONS } from "./personReplacementWorkflow.js";
import { createPersonReplacementOutputCoordinator } from "./personReplacementOutputCoordinator.js";
import { createPersonReplacementVoiceSeparationRuntime } from "./personReplacementVoiceSeparation.js";
import { PERSON_REPLACEMENT_OUTPUT_TRANSITIONS, transitionPersonReplacementOutput } from "./personReplacementOutputLineage.js";
import { PERSON_REPLACEMENT_CUT_EPSILON_SEC as a1098_0x4fcd89, buildPersonReplacementDetectedShotCutRanges, normalizePersonReplacementShotCutRanges } from "./personReplacementShotCutModel.js";
import { materializePersonReplacementShotPlayback } from "./personReplacementShotReverse.js";
import { hydratePersonReplacementSourcePlaybackRefs } from "./personReplacementSourcePlayback.js";
import { createPersonReplacementShotCutMutationCoordinator, createPersonReplacementShotReverseOperation } from "./personReplacementShotCutMutationCoordinator.js";
import { createPersonReplacementVideoPreparationRunner } from "./personReplacementVideoPreparation.js";
import { createPersonReplacementVideoTaskRuntime } from "./personReplacementVideoTaskRuntime.js";
import { buildPersonReplacementSourceCharacters as a1098_0x39c187, normalizePersonReplacementBoundingBox, orderAndRelabelPersonReplacementPeople } from "./personReplacementSourceIdentity.js";
import { REPLACEMENT_STUDIO_NAME } from "./replacementStudioTerminology.js";
import { normalizePersonReplacementProjectLibrary, removePersonReplacementProject, upsertPersonReplacementProject } from "./personReplacementProjectLibrary.js";
import { detectPersonReplacementPeople, identifyPersonReplacementPeople } from "../../../api/personReplacementModelPackApi.js";
import { fetchVideoFirstFrameThumbFromServer } from "../../../api/videoThumbApi.js";
import { fetchVideoMetaFromServer } from "../../../api/videoMetaApi.js";
import { enqueueElectronMediaTask } from "../../../api/localMediaTaskApi.js";
import { initAudioVoicePanel } from "../audioVoicePanel.js";
import { localPathToUrl, normalizeLocalPath, pickResultLocalPath } from "../../utils/localMediaPath.js";
import { createTrackedMediaObjectUrl, revokeTrackedMediaObjectUrl } from "../../services/mediaObjectUrlRegistry.js";
import { getImageGenerationResultError, getSuccessfulImageGenerationItems, normalizeImageGenerationResult } from "../../components/aigenImage/imageGenerationResultRenderer.js";
import { buildCharacterAssetImageGenerationPayload } from "../characterAssets/characterAssetImageGeneration.js";
import { getModelManifest } from "../../manifests/index.js";
import { createWorkspacePersistenceCoordinator } from "../workspacePersistenceCoordinator.js";
import { saveMediaDownload, saveMediaFilesDownload } from "../../services/downloadSaveService.js";
import { checkLocalMediaExists as a1098_0x200c4a } from "../../services/projectService.js";
import { playCompletionSound } from "../../services/completionSoundService.js";
import { showGenerationCompleteNotification } from "../../services/completionNotificationService.js";
import { createPersonReplacementAppearanceAssetLibraryOperation, readPersonReplacementLibraryAssets } from "./personReplacementAssetPackage.js";
import { buildPersonReplacementLibraryVoiceReference, getPersonReplacementAudioSavedName, getPersonReplacementLibraryAudioRef } from "./personReplacementVoiceLibrary.js";
function normalizeText(_0x2687b5) {
  return String(_0x2687b5 ?? "").trim();
}
function resolveSmartClipFailureMessage(_0x3854f8) {
  const _0x1d04ad = _0x3854f8?.stages?.keyframes?.error || _0x3854f8?.error;
  if (normalizeText(_0x1d04ad?.code) === "no_results") {
    return "视频无法读取有效时长或提取关键帧";
  }
  return normalizeText(_0x1d04ad?.message || _0x1d04ad) || "视频未检测到可用片段";
}
function cloneJson(_0x1642de) {
  if (_0x1642de && typeof _0x1642de === "object") {
    return JSON.parse(JSON.stringify(_0x1642de));
  } else {
    return _0x1642de;
  }
}
function nowIso() {
  return new Date().toISOString();
}
function createId(_0x4eb011) {
  const _0x56855d = globalThis.crypto?.randomUUID?.();
  return _0x4eb011 + "-" + (_0x56855d || Date.now() + "-" + Math.round(Math.random() * 100000));
}
function resolveMediaRef(_0x426348) {
  if (typeof _0x426348 === "string") {
    return normalizeText(_0x426348);
  }
  return normalizeText(pickResultLocalPath(_0x426348) || _0x426348?.displayUrl || _0x426348?.videoUrl || _0x426348?.imageUrl || _0x426348?.url || _0x426348?.originalUrl || _0x426348?.path);
}
function resolveMediaUrl(_0x3fef07) {
  const _0x7d2756 = resolveMediaRef(_0x3fef07);
  if (_0x7d2756) {
    return localPathToUrl(_0x7d2756) || _0x7d2756;
  } else {
    return "";
  }
}
function resolveDurationSec(_0x166366) {
  const _0x355745 = Number(_0x166366?.durationSec ?? _0x166366?.videoDuration ?? _0x166366?.duration ?? _0x166366?.metadata?.duration);
  if (Number.isFinite(_0x355745) && _0x355745 > 0) {
    return _0x355745;
  } else {
    return 0;
  }
}
function resolveVideoThumbnailRef(_0x25a50c) {
  return normalizeText(_0x25a50c?.posterLocalPath || _0x25a50c?.thumbLocalPath || _0x25a50c?.posterUrl || _0x25a50c?.thumbUrl);
}
function resolveVideoPlaybackRef(_0x1c2fd8) {
  return normalizeText(normalizeLocalPath(_0x1c2fd8?.displayLocalPath || _0x1c2fd8?.displayUrl) || _0x1c2fd8?.displayUrl);
}
function createProjectTitle(_0x34afc3) {
  return normalizeText(_0x34afc3).replace(/^.*[\\/]/u, "").replace(/\.[^.]+$/u, "") || "未命名人物替换项目";
}
function createUploadedAssetName(_0x26891e, _0x2cb9b6) {
  return normalizeText(_0x26891e).replace(/^.*[\\/]/u, "").replace(/\.[^.]+$/u, "") || _0x2cb9b6;
}
function getFirstSuccessfulImageRef(_0xe8fa0f) {
  const _0x74bc3 = normalizeImageGenerationResult(_0xe8fa0f);
  const _0x523a31 = getSuccessfulImageGenerationItems(_0x74bc3)[0];
  const _0x822ffc = resolveMediaRef(_0x523a31?.imageUrl || _0x523a31?.url || _0x523a31?.sourceUrl || _0x523a31?.thumbUrl || _0x523a31);
  if (!_0x822ffc) {
    throw new Error(getImageGenerationResultError(_0x74bc3) || "图像生成结果缺少可用图片");
  }
  return _0x822ffc;
}
const createApplicationProject = normalizeReplacementStudioApplicationProject;
function createInitialProject() {
  const _0x102d53 = nowIso();
  return createApplicationProject(createPersonReplacementProject({
    id: createId("person-replacement"),
    title: "未命名人物替换项目",
    status: "draft",
    settings: {
      characterImageModelId: PERSON_REPLACEMENT_DEFAULT_IMAGE_MODEL_ID,
      characterImageProvider: "apimart",
      replacementImageModelId: PERSON_REPLACEMENT_DEFAULT_IMAGE_MODEL_ID,
      replacementImageProvider: "apimart",
      replacementModelId: PERSON_REPLACEMENT_DEFAULT_VIDEO_MODEL_ID,
      replacementVideoInputMode: PERSON_REPLACEMENT_VIDEO_INPUT_MODE_FIRST_FRAME,
      automationMode: "review"
    },
    sources: [],
    characters: [],
    shots: [],
    workspace: {
      view: "home",
      step: 1
    },
    createdAt: _0x102d53,
    updatedAt: _0x102d53
  }));
}
function isPersistable(_0xc46857) {
  return Boolean(_0xc46857?.characters?.length || _0xc46857?.shots?.length || _0xc46857?.status && _0xc46857.status !== "draft");
}
export function createReplacementStudioApplication({
  documentObject = globalThis.document,
  windowObject = globalThis.window,
  mountTarget = "#v2-wrap",
  uploadFile: _0xb16d1a,
  checkMediaExists = a1098_0x200c4a,
  generateCharacterImage: _0x3f6aff,
  generateReplacementImage = _0x3f6aff,
  resumeReplacementImage: _0x59af13,
  generateReplacementVideo: _0xe530be,
  resolveInstallId: _0x3b2115,
  loadWorkspace: _0x1f18f9,
  saveWorkspace: _0xa3be72,
  runSmartClip = runPersonReplacementSmartClip,
  fetchFirstFrame = fetchVideoFirstFrameThumbFromServer,
  fetchVideoMeta = fetchVideoMetaFromServer,
  detectPeople = detectPersonReplacementPeople,
  identifyPeople = identifyPersonReplacementPeople,
  createWorkspace = createReplacementStudioWorkspace,
  createVoicePanel = initAudioVoicePanel,
  enqueueMediaTask = enqueueElectronMediaTask,
  playCompletion = playCompletionSound,
  showCompletionNotification = showGenerationCompleteNotification,
  saveMedia = saveMediaDownload,
  saveMediaFiles = saveMediaFilesDownload,
  saveAssetPackageItem = null,
  persistOutputFromUrl = null,
  createOutputCanvas = null,
  listLibraryAssets = () => [],
  subscribeLibraryAssets = null,
  onRequestClose = () => {},
  showToast = windowObject?.showToast?.bind?.(windowObject) || (() => {})
} = {}) {
  let _0x479b40 = createInitialProject();
  const _0x28b128 = createReplacementStudioProjectSession({
    initialProject: _0x479b40,
    now: nowIso
  });
  const _0x380d41 = _0x28b128.subscribe(_0x1d63ee => {
    _0x479b40 = _0x1d63ee.project;
    if (_0x1d63ee.source === "workspace" && _0x1d63ee.reason === "step-change" && _0x1d63ee.previousProject?.workspace?.step !== 3 && _0x1d63ee.project.workspace?.step === 3) {
      _0x5f123f();
    }
  });
  let _0x287023 = normalizePersonReplacementProjectLibrary();
  let _0x51132b = "home";
  let _0x37df20 = null;
  let _0x358ed5 = false;
  let _0x49358c = false;
  let _0x3f9ddc = {
    status: typeof _0xa3be72 === "function" ? "saved" : "idle",
    error: "",
    retryAttempt: 0
  };
  let _0x1ccd62 = null;
  let _0x5495da = null;
  let _0x2b11ea = null;
  let _0x44d82e = null;
  let _0x52ad81 = () => {};
  const _0x510be3 = new Set();
  const _0x14c38c = new Set();
  const _0x50bb60 = createPersonReplacementShotCutMutationCoordinator();
  const _0x1cfe1d = new Map();
  const _0x42b776 = (_0x512649 = {}) => {
    Promise.allSettled([Promise.resolve().then(() => playCompletion?.("generation-success")), Promise.resolve().then(() => showCompletionNotification?.(_0x512649))]).then(_0x1f9c0b => {
      _0x1f9c0b.forEach(_0x5007c4 => {
        if (_0x5007c4.status !== "rejected") {
          return;
        }
        console.warn("[replacementStudio] completion feedback failed", _0x5007c4.reason);
      });
    });
  };
  const _0x341c67 = ({
    kind = "image",
    mediaRef = ""
  } = {}) => {
    const _0x3ba814 = kind === "video";
    const _0x2a8873 = kind === "asset";
    _0x42b776({
      body: _0x3ba814 ? "人物替换视频生成完成。" : _0x2a8873 ? "人物形象生成完成。" : "人物替换首帧生成完成。",
      mediaKind: _0x3ba814 ? "video" : "image",
      node: {
        name: _0x3ba814 ? "人物替换视频" : _0x2a8873 ? "人物形象" : "人物替换首帧",
        ...(_0x3ba814 ? {
          videoUrl: mediaRef
        } : {
          imageUrl: mediaRef
        })
      }
    });
  };
  const _0x4d6117 = ({
    kind = "image",
    totalCount = 0,
    successCount = 0
  } = {}) => {
    const _0x1d37fc = Math.max(0, Math.trunc(Number(totalCount) || 0));
    if (!_0x1d37fc) {
      return false;
    }
    const _0x18dc2a = Math.max(0, Math.min(_0x1d37fc, Math.trunc(Number(successCount) || 0)));
    const _0x203288 = _0x1d37fc - _0x18dc2a;
    const _0x1ed7ae = kind === "asset" ? "人物形象" : kind === "video" ? "替换视频" : "替换首帧";
    _0x42b776({
      body: _0x203288 > 0 ? "批量" + _0x1ed7ae + "生成已结束：成功 " + _0x18dc2a + " 个，失败 " + _0x203288 + " 个。" : _0x1d37fc + " 个" + _0x1ed7ae + "已全部生成完成。"
    });
    return true;
  };
  async function _0x45c478(_0x523b87) {
    const _0x500b70 = normalizeText(windowObject?.__aicInstallId || globalThis.__aicInstallId);
    if (getModelManifest(_0x523b87)?.vip !== true) {
      return _0x500b70;
    }
    try {
      const _0x382ac2 = typeof _0x3b2115 === "function" ? await _0x3b2115() : typeof windowObject?.ensureSubscriptionInstallId === "function" ? await windowObject.ensureSubscriptionInstallId() : "";
      return normalizeText(_0x382ac2) || _0x500b70;
    } catch {
      return _0x500b70;
    }
  }
  const _0x1acf50 = () => Boolean(_0x1ccd62 || _0x510be3.size || _0x14c38c.size);
  const _0xd4e5bb = (_0x2f11d1 = _0x479b40.id) => {
    const _0x4c4f0 = normalizeText(_0x2f11d1);
    const _0xc0db22 = _0x4c4f0 === normalizeText(_0x479b40.id);
    return Boolean(_0xc0db22 && _0x1ccd62 || _0xc0db22 && _0x510be3.size || _0x5495da?.hasActiveTasksForProject?.(_0x4c4f0) || _0x2b11ea?.hasActiveTasksForProject?.(_0x4c4f0) || _0xc0db22 && _0x14c38c.size);
  };
  const _0x11c1d6 = () => _0x479b40.sources.some(_0x1de294 => normalizeText(_0x1de294?.processingStatus).toLowerCase() === "uploading");
  const _0xbc305d = (_0x1e203d, _0x5364a0) => normalizeText(_0x1e203d) + "" + normalizeText(_0x5364a0);
  const _0x4fc089 = (_0x4126d3, _0x2a9d17 = _0x479b40.id) => {
    const _0x30509d = _0xbc305d(_0x2a9d17, _0x4126d3);
    const _0x4af212 = _0x1cfe1d.get(_0x30509d) || "";
    _0x1cfe1d.delete(_0x30509d);
    return _0x4af212;
  };
  const _0x46ee6d = (_0x1cf9a1, _0xfa1a48 = _0x479b40.id) => {
    const _0x5abdb0 = _0x4fc089(_0x1cf9a1, _0xfa1a48);
    if (_0x5abdb0) {
      revokeTrackedMediaObjectUrl(_0x5abdb0);
    }
  };
  const _0x1a32b6 = (_0x1d693f = "") => {
    const _0x278727 = normalizeText(_0x1d693f);
    [..._0x1cfe1d.entries()].forEach(([_0x1aedfc, _0x34df20]) => {
      if (_0x278727 && !_0x1aedfc.startsWith(_0x278727 + "")) {
        return;
      }
      _0x1cfe1d.delete(_0x1aedfc);
      if (_0x34df20) {
        revokeTrackedMediaObjectUrl(_0x34df20);
      }
    });
  };
  const _0x1a807c = (_0x4b1af2, _0x37f327) => {
    const _0x2d9595 = normalizeText(_0x37f327);
    if (!_0x4b1af2 || !_0x2d9595) {
      return "";
    }
    _0x46ee6d(_0x2d9595);
    try {
      const _0x7c2b34 = createTrackedMediaObjectUrl(_0x4b1af2, {
        kind: "video",
        ownerId: "person-replacement:" + _0x479b40.id + ":" + _0x2d9595,
        sourceUrl: normalizeText(_0x4b1af2.name)
      });
      if (_0x7c2b34) {
        _0x1cfe1d.set(_0xbc305d(_0x479b40.id, _0x2d9595), _0x7c2b34);
      }
      return _0x7c2b34;
    } catch {
      return "";
    }
  };
  const _0x1a8fc5 = (_0x1f7366 = _0x479b40) => {
    if (isPersistable(_0x1f7366)) {
      _0x287023 = upsertPersonReplacementProject(_0x287023, _0x1f7366);
    }
  };
  const _0x358c04 = () => readPersonReplacementLibraryAssets(listLibraryAssets);
  const _0x461c5c = () => ({
    ...cloneJson(_0x479b40),
    sourcePreviewRefs: Object.fromEntries([..._0x1cfe1d.entries()].flatMap(([_0x29da2c, _0x2c69c5]) => {
      const [_0x393011, _0x15d6f2] = _0x29da2c.split("");
      if (_0x393011 === normalizeText(_0x479b40.id) && _0x479b40.sources.some(_0x470712 => _0x470712.id === _0x15d6f2)) {
        return [[_0x15d6f2, _0x2c69c5]];
      } else {
        return [];
      }
    })),
    libraryProjects: cloneJson(_0x287023.projects),
    libraryAssets: cloneJson(_0x358c04()),
    persistenceState: cloneJson(_0x3f9ddc),
    workspace: {
      ...cloneJson(_0x479b40.workspace),
      view: _0x51132b
    }
  });
  const _0x134ff1 = (_0x11c23a, {
    error = "",
    retryAttempt = _0x3f9ddc.retryAttempt
  } = {}) => {
    _0x3f9ddc = {
      status: _0x11c23a,
      error: normalizeText(error),
      retryAttempt: Math.max(0, Math.trunc(Number(retryAttempt) || 0))
    };
    _0x37df20?.setPersistenceState?.(cloneJson(_0x3f9ddc));
    return _0x3f9ddc;
  };
  const _0x124bd5 = createWorkspacePersistenceCoordinator({
    ready: false,
    debounceMs: 350,
    save: _0xa3be72,
    getSnapshot: () => {
      _0x1a8fc5();
      return cloneJson(_0x287023);
    },
    setTimeoutFn: windowObject?.setTimeout?.bind?.(windowObject),
    clearTimeoutFn: windowObject?.clearTimeout?.bind?.(windowObject),
    onStateChange: ({
      status: _0x38f374,
      error: _0x1f9703,
      retryAttempt: _0x4605dc
    }) => {
      _0x134ff1(_0x38f374, {
        error: _0x1f9703,
        retryAttempt: _0x4605dc
      });
    },
    onError: _0x124ef2 => {
      console.warn("[replacementStudio] persist failed", _0x124ef2);
    }
  });
  const _0x45e8e9 = ({
    force = false
  } = {}) => _0x358ed5 ? Promise.resolve(null) : _0x124bd5.flush({
    force: force
  });
  const _0x18fe20 = () => {
    if (_0x358ed5) {
      return;
    }
    _0x124bd5.schedule();
  };
  const _0x190aa6 = () => _0x37df20?.setProject?.(_0x461c5c());
  const _0x28a055 = () => {
    const _0x504329 = _0x461c5c();
    if (typeof _0x37df20?.syncProjectState === "function") {
      return _0x37df20.syncProjectState(_0x504329);
    }
    return _0x37df20?.setProject?.(_0x504329);
  };
  _0x28b128.connect({
    rememberProject: _0x1a8fc5,
    presentProject: ({
      presentation: _0x1b7fd6
    }) => {
      if (_0x1b7fd6 === "state") {
        return _0x28a055();
      }
      return _0x190aa6();
    },
    schedulePersistence: _0x18fe20
  });
  const _0x5cae27 = (_0x9e4fa9, {
    persist = true,
    sync = true,
    renderWorkspace = true
  } = {}) => _0x28b128.replace(_0x9e4fa9, {
    persist: persist,
    presentation: !sync ? "none" : renderWorkspace ? "render" : "state"
  });
  const _0x4442f8 = async ({
    expectedProjectId = _0x479b40.id,
    renderWorkspace = true
  } = {}) => {
    const _0xbcaa93 = normalizeText(expectedProjectId);
    const _0x1efdb3 = cloneJson(_0x479b40);
    const _0x5ef8e8 = await hydratePersonReplacementSourcePlaybackRefs(_0x1efdb3, {
      checkMediaExists: checkMediaExists
    });
    if (_0x358ed5 || !_0x5ef8e8.changed || normalizeText(_0x479b40.id) !== _0xbcaa93) {
      return false;
    }
    const _0x69a562 = new Map(_0x5ef8e8.project.sources.map(_0x518f27 => [normalizeText(_0x518f27?.id), _0x518f27]));
    let _0x554847 = false;
    const _0x12f20c = _0x479b40.sources.map(_0x4f06e3 => {
      const _0x26eba4 = _0x69a562.get(normalizeText(_0x4f06e3?.id));
      if (!_0x26eba4 || normalizeText(_0x26eba4.videoRef) !== normalizeText(_0x4f06e3.videoRef) || normalizeText(_0x26eba4.playbackVideoRef) === normalizeText(_0x4f06e3.playbackVideoRef)) {
        return _0x4f06e3;
      }
      _0x554847 = true;
      return {
        ..._0x4f06e3,
        ...(_0x26eba4.assetId ? {
          assetId: _0x26eba4.assetId
        } : {}),
        playbackVideoRef: _0x26eba4.playbackVideoRef
      };
    });
    if (!_0x554847) {
      return false;
    }
    _0x5cae27({
      ..._0x479b40,
      sources: _0x12f20c
    }, {
      renderWorkspace: renderWorkspace
    });
    return true;
  };
  const _0x496d57 = _0x5089e5 => {
    const _0x56013c = normalizeText(_0x5089e5);
    if (!_0x56013c) {
      return null;
    }
    if (normalizeText(_0x479b40.id) === _0x56013c) {
      return cloneJson(_0x479b40);
    }
    const _0x39769d = _0x287023.projects.find(_0x10b12b => normalizeText(_0x10b12b?.id) === _0x56013c);
    if (_0x39769d) {
      return createApplicationProject(_0x39769d, _0x39769d);
    } else {
      return null;
    }
  };
  const _0x1f72d0 = (_0x480600, _0x491c04, {
    persist = true,
    renderWorkspace = false
  } = {}) => {
    const _0x2837ec = normalizeText(_0x480600 || _0x491c04?.id);
    if (!_0x2837ec || normalizeText(_0x491c04?.id) !== _0x2837ec) {
      return null;
    }
    if (normalizeText(_0x479b40.id) === _0x2837ec) {
      return _0x5cae27(_0x491c04, {
        persist: persist,
        renderWorkspace: renderWorkspace
      });
    }
    const _0x16510b = _0x287023.projects.find(_0x3bb960 => normalizeText(_0x3bb960?.id) === _0x2837ec);
    if (!_0x16510b) {
      return null;
    }
    const _0x3fc78a = normalizeText(_0x479b40.id);
    const _0x4fdbaa = createApplicationProject(_0x491c04, _0x16510b);
    _0x287023 = upsertPersonReplacementProject(_0x287023, _0x4fdbaa);
    _0x287023 = {
      ..._0x287023,
      currentProjectId: _0x3fc78a || _0x287023.currentProjectId
    };
    if (persist) {
      _0x18fe20();
    }
    if (_0x51132b === "home") {
      _0x28a055();
    }
    return cloneJson(_0x4fdbaa);
  };
  _0x5495da = createPersonReplacementImageTaskRuntime({
    getProject: () => _0x479b40,
    getProjectById: _0x496d57,
    commitProject: _0x48701f => _0x5cae27(_0x48701f, {
      renderWorkspace: false
    }),
    commitProjectById: (_0x39ec66, _0x37e13a) => _0x1f72d0(_0x39ec66, _0x37e13a, {
      renderWorkspace: false
    }),
    generateImage: generateReplacementImage,
    resumeImageTask: _0x59af13,
    createRequestId: () => createId("replacement-image-request"),
    resolvePromptRequest: createPersonReplacementImagePromptRequestResolver(),
    showToast: showToast,
    now: nowIso,
    notifyCompletion: _0x341c67,
    persistNow: _0x45e8e9
  });
  const _0x436c50 = createPersonReplacementAppearanceAssetLibraryOperation({
    getProject: () => _0x479b40,
    setProject: _0x5cae27,
    saveAssetPackageItem: saveAssetPackageItem,
    persistOutputFromUrl: persistOutputFromUrl,
    showToast: showToast
  });
  const _0x4ff489 = () => {
    if (isPersistable(_0x479b40)) {
      _0x1a8fc5();
      _0x28b128.replace(createInitialProject(), {
        persist: false,
        presentation: "none",
        reason: "fresh-import",
        touchUpdatedAt: false
      });
    }
  };
  const _0x38a874 = _0x5556f7 => {
    const _0x540679 = _0x287023.projects.find(_0x55cf21 => _0x55cf21.id === normalizeText(_0x5556f7));
    if (!_0x540679) {
      return null;
    }
    const _0x258d06 = normalizeText(_0x540679.id) !== normalizeText(_0x479b40.id);
    if (_0x11c1d6() && _0x258d06) {
      showToast("素材正在上传，请等待上传完成或取消上传后再打开其他项目。", "info");
      return null;
    }
    if (_0x1acf50() && _0x258d06) {
      showToast(_0x1ccd62 ? "当前项目正在后台处理，请完成后再打开其他项目。" : "当前项目仍有任务处理中，请完成后再打开其他项目。", "info");
      return null;
    }
    _0x28b128.replace(_0x540679, {
      persist: false,
      presentation: "none",
      reason: "open-project",
      touchUpdatedAt: false
    });
    _0x51132b = "project";
    _0x190aa6();
    _0x4442f8({
      expectedProjectId: _0x479b40.id
    });
    _0x5495da?.resumeRecoverable?.();
    _0x2b11ea?.resumeRecoverable?.();
    if (_0x479b40.workspace.step === 3) {
      _0x5f123f();
    }
    return cloneJson(_0x479b40);
  };
  const _0x349079 = () => {
    _0x1a8fc5();
    if (_0xd4e5bb(_0x479b40.id)) {
      _0x51132b = "home";
      _0x190aa6();
      _0x18fe20();
      return _0x461c5c();
    }
    _0x1a32b6(_0x479b40.id);
    _0x28b128.replace(createInitialProject(), {
      persist: false,
      presentation: "none",
      reason: "show-project-home",
      touchUpdatedAt: false
    });
    _0x51132b = "home";
    _0x190aa6();
    _0x18fe20();
    return _0x461c5c();
  };
  const _0x334e3e = (_0x96d3d5, _0x3fec7b) => {
    const _0x4d8c90 = normalizeText(_0x96d3d5);
    const _0x4d9304 = _0x287023.projects.find(_0x15904b => _0x15904b.id === _0x4d8c90);
    if (!_0x4d9304 || typeof _0x3fec7b !== "function") {
      return null;
    }
    const _0x1636bb = createApplicationProject({
      ..._0x3fec7b(cloneJson(_0x4d9304)),
      id: _0x4d8c90,
      updatedAt: nowIso()
    }, _0x4d9304);
    _0x287023 = normalizePersonReplacementProjectLibrary({
      ..._0x287023,
      currentProjectId: _0x287023.currentProjectId,
      projects: _0x287023.projects.map(_0x312e08 => _0x312e08.id === _0x4d8c90 ? _0x1636bb : _0x312e08)
    });
    if (_0x479b40.id === _0x4d8c90) {
      _0x28b128.replace(_0x1636bb, {
        persist: false,
        presentation: "none",
        reason: "update-library-project",
        touchUpdatedAt: false
      });
    }
    _0x190aa6();
    _0x18fe20();
    return _0x461c5c();
  };
  const _0x22f093 = ({
    projectId: _0x12d927,
    title: _0x45629a
  } = {}) => _0x334e3e(_0x12d927, _0x3a6414 => ({
    ..._0x3a6414,
    title: normalizeText(_0x45629a) || "未命名人物替换项目"
  }));
  const _0x343981 = ({
    projectId: _0x1ce679
  } = {}) => {
    const _0x4eba64 = _0x287023.projects.find(_0x47a482 => _0x47a482.id === normalizeText(_0x1ce679));
    if (!_0x4eba64) {
      return null;
    }
    const _0x5e8368 = nowIso();
    const _0x1551c5 = createApplicationProject({
      ...cloneJson(_0x4eba64),
      id: createId("person-replacement"),
      title: (normalizeText(_0x4eba64.title) || "未命名人物替换项目") + " 副本",
      archivedAt: 0,
      createdAt: _0x5e8368,
      updatedAt: _0x5e8368,
      output: {
        ...(_0x4eba64.output || {}),
        canvasBinding: {}
      },
      workspace: {
        ...(_0x4eba64.workspace || {}),
        view: "home",
        openProjectMenuId: "",
        pendingDeleteProjectId: ""
      }
    });
    _0x287023 = normalizePersonReplacementProjectLibrary({
      ..._0x287023,
      currentProjectId: _0x287023.currentProjectId,
      projects: [_0x1551c5, ..._0x287023.projects]
    });
    _0x190aa6();
    _0x18fe20();
    showToast("项目副本已创建。", "success");
    return _0x461c5c();
  };
  const _0x23e654 = ({
    projectId: _0x158fda,
    archived: _0x1dacb3
  } = {}) => _0x334e3e(_0x158fda, _0x101ca6 => ({
    ..._0x101ca6,
    archivedAt: _0x1dacb3 ? Date.now() : 0
  }));
  const _0x18583c = ({
    projectId: _0x3b8428
  } = {}) => {
    const _0x17649e = normalizeText(_0x3b8428);
    if (!_0x287023.projects.some(_0xa65dbd => _0xa65dbd.id === _0x17649e)) {
      return null;
    }
    if (_0xd4e5bb(_0x17649e)) {
      showToast(_0x1ccd62 ? "当前项目正在后台处理，暂时不能删除。" : "当前项目仍有任务处理中，暂时不能删除。", "info");
      return null;
    }
    _0x287023 = removePersonReplacementProject(_0x287023, _0x17649e);
    _0x1a32b6(_0x17649e);
    if (_0x479b40.id === _0x17649e) {
      _0x28b128.replace(createInitialProject(), {
        persist: false,
        presentation: "none",
        reason: "delete-project",
        touchUpdatedAt: false
      });
    }
    _0x190aa6();
    _0x18fe20();
    showToast("人物替换项目已删除。", "success");
    return _0x461c5c();
  };
  const _0x2f70d4 = ({
    sourceId: _0x211688
  } = {}) => {
    const _0x598844 = normalizeText(_0x211688);
    const _0x36590f = _0x479b40.sources.find(_0x40af44 => _0x40af44.id === _0x598844);
    if (!_0x36590f) {
      return null;
    }
    _0x46ee6d(_0x598844);
    const _0x401e2e = _0x479b40.sources.filter(_0x4c5d05 => _0x4c5d05.id !== _0x598844).map((_0x30e14d, _0x99628d) => ({
      ..._0x30e14d,
      order: _0x99628d
    }));
    const _0x22e618 = _0x479b40.shots.filter(_0x5b0584 => _0x5b0584.sourceId !== _0x598844);
    const _0x3077de = new Set(_0x22e618.flatMap(_0x1108bd => _0x1108bd.people.map(_0x145ff8 => normalizeText(_0x145ff8.sourceCharacterId)).filter(Boolean)));
    const _0x7d820 = _0x479b40.audio.selectedSourceId === _0x598844;
    const _0x23dd50 = Boolean(_0x36590f.videoRef) && _0x479b40.audio.originalAudioRef === _0x36590f.videoRef;
    const _0x472d1c = _0x7d820 ? _0x401e2e[0]?.id || "" : _0x479b40.audio.selectedSourceId;
    const _0x785227 = _0x401e2e.find(_0x16a5c4 => _0x16a5c4.id === _0x472d1c) || _0x401e2e[0] || null;
    const _0x2f7f8 = Boolean(_0x479b40.output.originalMasterRef) && _0x479b40.audio.originalAudioRef === _0x479b40.output.originalMasterRef;
    const _0x5bcc3b = _0x23dd50 || _0x2f7f8 ? _0x785227?.videoRef || "" : _0x479b40.audio.originalAudioRef;
    const _0x5a61c2 = {
      ..._0x479b40,
      title: _0x401e2e.length ? _0x479b40.title : "未命名人物替换项目",
      status: _0x401e2e.length ? _0x479b40.status : "draft",
      source: _0x401e2e[0] || {},
      sources: _0x401e2e,
      shots: _0x22e618,
      sourceCharacters: a1098_0x39c187(_0x22e618, _0x479b40.sourceCharacters),
      mappings: _0x479b40.mappings.filter(_0x422693 => _0x3077de.has(normalizeText(_0x422693.sourceCharacterId))),
      audio: {
        ..._0x479b40.audio,
        originalAudioRef: _0x5bcc3b,
        selectedSourceId: _0x472d1c
      }
    };
    const _0x28f453 = _0x22e618.length === _0x479b40.shots.length ? _0x5a61c2 : transitionPersonReplacementOutput(_0x5a61c2, {
      type: PERSON_REPLACEMENT_OUTPUT_TRANSITIONS.SOURCE_GRAPH_CHANGED,
      nextOriginalAudioRef: _0x5bcc3b
    });
    const _0xc33927 = !_0x401e2e.length && !_0x22e618.length && !_0x479b40.characters.length;
    if (_0xc33927) {
      _0x287023 = removePersonReplacementProject(_0x287023, _0x479b40.id);
      _0x28b128.replace({
        ..._0x28f453,
        updatedAt: nowIso()
      }, {
        persist: false,
        presentation: "none",
        reason: "remove-final-source",
        touchUpdatedAt: false
      });
      _0x190aa6();
      _0x18fe20();
    } else {
      _0x5cae27(_0x28f453);
    }
    return _0x461c5c();
  };
  async function _0x365474(_0x8095c0 = []) {
    const _0x54b95e = (Array.isArray(_0x8095c0) ? _0x8095c0 : [_0x8095c0]).filter(Boolean);
    if (!_0x54b95e.length) {
      return {
        ok: false,
        reason: "missing-file"
      };
    }
    if (_0x1ccd62) {
      showToast("当前项目正在后台处理，请完成后再新建项目。", "info");
      return {
        ok: false,
        reason: "already-running"
      };
    }
    if (typeof _0xb16d1a !== "function") {
      throw new Error(REPLACEMENT_STUDIO_NAME + "缺少素材上传服务");
    }
    if (_0x51132b !== "home") {
      _0x51132b = "home";
    }
    _0x4ff489();
    const _0x49d139 = [..._0x479b40.sources];
    const _0x20a01c = _0x54b95e.map((_0x1d9883, _0x21f105) => ({
      id: createId("source"),
      fileName: normalizeText(_0x1d9883.name) || "视频 " + (_0x49d139.length + _0x21f105 + 1),
      videoRef: "",
      processingStatus: "uploading",
      processingProgress: 0,
      order: _0x49d139.length + _0x21f105
    }));
    _0x20a01c.forEach((_0x2e5ef2, _0x445ffa) => {
      _0x1a807c(_0x54b95e[_0x445ffa], _0x2e5ef2.id);
    });
    _0x5cae27({
      ..._0x479b40,
      title: _0x479b40.title === "未命名人物替换项目" ? createProjectTitle(_0x54b95e[0]?.name) : _0x479b40.title,
      sources: [..._0x49d139, ..._0x20a01c],
      source: _0x49d139[0] || _0x20a01c[0],
      workspace: {
        ..._0x479b40.workspace,
        view: "home",
        step: 1
      }
    });
    const _0x54a15d = [];
    for (let _0x5ce67e = 0; _0x5ce67e < _0x54b95e.length; _0x5ce67e += 1) {
      const _0x39fbc5 = _0x54b95e[_0x5ce67e];
      const _0x5ccd3a = _0x20a01c[_0x5ce67e];
      try {
        const _0x4609c1 = await _0xb16d1a(_0x39fbc5, _0x479b40.id);
        const _0x3f7f95 = resolveMediaRef(_0x4609c1);
        if (!_0x3f7f95) {
          throw new Error("源视频保存结果缺少可用地址");
        }
        const _0x314d65 = resolveVideoPlaybackRef(_0x4609c1);
        const _0x4e11fd = resolveDurationSec(_0x4609c1);
        const _0x1ea41e = resolveVideoThumbnailRef(_0x4609c1);
        if (!_0x479b40.sources.some(_0x163f14 => _0x163f14.id === _0x5ccd3a.id)) {
          continue;
        }
        _0x54a15d.push(_0x4609c1);
        const _0x48fcc9 = _0x1ea41e ? _0x4fc089(_0x5ccd3a.id) : "";
        _0x5cae27({
          ..._0x479b40,
          sources: _0x479b40.sources.map(_0x14f0a4 => _0x14f0a4.id === _0x5ccd3a.id ? {
            ..._0x14f0a4,
            assetId: normalizeText(_0x4609c1?.assetId),
            videoRef: _0x3f7f95,
            playbackVideoRef: _0x314d65,
            thumbnailRef: _0x1ea41e,
            durationSec: _0x4e11fd || _0x14f0a4.durationSec,
            processingStatus: "ready-to-start",
            processingProgress: 0
          } : _0x14f0a4),
          audio: _0x479b40.audio.originalAudioRef ? _0x479b40.audio : {
            ..._0x479b40.audio,
            originalAudioRef: _0x3f7f95,
            selectedSourceId: _0x5ccd3a.id
          }
        });
        if (_0x48fcc9) {
          revokeTrackedMediaObjectUrl(_0x48fcc9);
        }
      } catch (_0x25519d) {
        _0x5cae27({
          ..._0x479b40,
          sources: _0x479b40.sources.map(_0x46ca9f => _0x46ca9f.id === _0x5ccd3a.id ? {
            ..._0x46ca9f,
            processingStatus: "failed",
            error: _0x25519d?.message || "视频上传失败"
          } : _0x46ca9f)
        });
        showToast(_0x25519d?.message || "视频上传失败", "error");
      }
    }
    const _0x1d45c8 = _0x479b40.sources.filter(_0x3bcd4f => _0x3bcd4f.videoRef).length;
    if (_0x1d45c8) {
      showToast("已加入 " + _0x1d45c8 + " 个视频。", "success");
    }
    return {
      ok: _0x1d45c8 > 0,
      project: _0x461c5c(),
      sources: _0x54a15d
    };
  }
  async function _0x4adfc7(_0x1e60ea) {
    const {
      personDetection: _0x4dde73,
      ..._0x512a49
    } = _0x1e60ea;
    if (!_0x1e60ea.keyframeRef) {
      return {
        ..._0x512a49,
        analysisStatus: "failed",
        reviewRequired: true
      };
    }
    try {
      const _0x50a8f8 = _0x4dde73 && typeof _0x4dde73 === "object" && Array.isArray(_0x4dde73.people) ? _0x4dde73 : await detectPeople(_0x1e60ea.keyframeRef, {
        maxPeople: 32
      });
      const _0x5567ae = [..._0x50a8f8.people].sort((_0x22a16e, _0x19666e) => {
        const _0x2ec4f1 = Number(_0x22a16e?.bbox?.x) || 0;
        const _0x18f8df = Number(_0x19666e?.bbox?.x) || 0;
        const _0x1b0a3e = Number(_0x22a16e?.bbox?.y) || 0;
        const _0x5a3217 = Number(_0x19666e?.bbox?.y) || 0;
        return _0x2ec4f1 - _0x18f8df || _0x1b0a3e - _0x5a3217;
      });
      const _0x59722d = _0x5567ae.map((_0x435ddf, _0x5510ec) => ({
        id: _0x1e60ea.id + "-person-" + (_0x5510ec + 1),
        sourceCharacterId: _0x1e60ea.sourceId + "-" + _0x1e60ea.id + "-person-" + (_0x5510ec + 1),
        targetCharacterId: "",
        targetAppearanceId: "",
        label: formatPersonReplacementPersonLabel(_0x5510ec),
        detectionClass: !normalizeText(_0x435ddf.className) || normalizeText(_0x435ddf.className).toLowerCase() === "person" ? "person" : "character",
        detectionMethod: "automatic",
        bbox: _0x435ddf.bbox,
        detectionConfidence: _0x435ddf.confidence,
        identityConfidence: 0,
        identityMatchSimilarity: 0,
        identityReviewStatus: "confirmed",
        identityReviewRequired: false,
        identityMethod: "fallback",
        ambiguousIdentityIds: [],
        orientationConfidence: Number(_0x435ddf.orientationConfidence) || 0,
        orientation: _0x435ddf.orientation || "unknown",
        orientationModelId: _0x435ddf.orientationModelId || "",
        occlusion: "none"
      }));
      return {
        ..._0x512a49,
        frame: _0x50a8f8.frame,
        people: _0x59722d,
        analysisStatus: "succeeded",
        reviewRequired: _0x59722d.length === 0
      };
    } catch (_0x3d7c4b) {
      return {
        ..._0x512a49,
        people: [],
        analysisStatus: "failed",
        reviewRequired: true,
        error: [_0x1e60ea.error, _0x3d7c4b?.message || "人物检测失败"].filter(Boolean).join("；")
      };
    }
  }
  async function _0x35a66f(_0x3520eb) {
    const _0x3745a6 = (Array.isArray(_0x3520eb) ? _0x3520eb : []).filter(_0x372e94 => _0x372e94.keyframeRef && _0x372e94.people.length);
    if (!_0x3745a6.length || typeof identifyPeople !== "function") {
      return {
        shots: _0x3520eb,
        sourceCharacters: a1098_0x39c187(_0x3520eb, _0x479b40.sourceCharacters),
        analysis: {
          status: _0x3745a6.length ? "failed" : "succeeded",
          modelId: "",
          stats: {
            identityCount: 0,
            reviewCount: 0
          },
          error: _0x3745a6.length ? "人物身份分析服务尚未初始化" : ""
        }
      };
    }
    try {
      const _0x29d009 = new Map(_0x479b40.sources.map((_0x5c2c62, _0x59ff11) => [_0x5c2c62.id, _0x5c2c62.order ?? _0x59ff11]));
      const _0x2d47eb = await identifyPeople(_0x3745a6.map((_0x597e84, _0x288505) => ({
        shotId: _0x597e84.id,
        sourceId: _0x597e84.sourceId,
        sourceOrder: _0x29d009.get(_0x597e84.sourceId) ?? 0,
        shotIndex: _0x597e84.index ?? _0x288505,
        shotTimeSec: _0x597e84.keyframeTimeSec ?? _0x597e84.startTimeSec,
        imageRef: _0x597e84.keyframeRef,
        people: _0x597e84.people.map(_0x47ef15 => ({
          personId: _0x47ef15.id,
          bbox: _0x47ef15.locator?.bbox || _0x47ef15.bbox,
          detectionConfidence: _0x47ef15.detectionConfidence
        }))
      })), {
        autoThreshold: _0x479b40.settings.identityAutoThreshold,
        reviewThreshold: _0x479b40.settings.identityReviewThreshold,
        ambiguityMargin: _0x479b40.settings.identityAmbiguityMargin,
        maxShotGap: 2
      });
      const _0x163bae = new Map((_0x2d47eb.assignments || []).map(_0x2fbccd => [_0x2fbccd.shotId + ":" + _0x2fbccd.personId, _0x2fbccd]));
      const _0x3a0424 = _0x3520eb.map(_0x302e37 => ({
        ..._0x302e37,
        people: _0x302e37.people.map(_0x452057 => {
          const _0x2fcbfc = _0x163bae.get(_0x302e37.id + ":" + _0x452057.id);
          if (!_0x2fcbfc) {
            return {
              ..._0x452057,
              identityReviewStatus: "confirmed",
              identityReviewRequired: false,
              identityMethod: "fallback"
            };
          }
          return {
            ..._0x452057,
            sourceCharacterId: _0x2fcbfc.sourceCharacterId,
            label: _0x452057.label || _0x2fcbfc.label,
            identityConfidence: _0x2fcbfc.identityConfidence,
            identityMatchSimilarity: _0x2fcbfc.matchSimilarity,
            identityReviewStatus: "confirmed",
            identityReviewRequired: false,
            identityMethod: "osnet",
            ambiguousIdentityIds: _0x2fcbfc.ambiguousIdentityIds || [],
            notes: _0x2fcbfc.notes || _0x452057.notes
          };
        })
      }));
      const _0x5dbfed = new Map((_0x2d47eb.identities || []).map(_0x4c8262 => [_0x4c8262.id, _0x4c8262]));
      const _0x31b114 = a1098_0x39c187(_0x3a0424, _0x479b40.sourceCharacters).map(_0x50ae75 => {
        const _0x450978 = _0x5dbfed.get(_0x50ae75.id);
        if (_0x450978) {
          return {
            ..._0x50ae75,
            name: _0x450978.name || _0x50ae75.name,
            confidence: _0x450978.confidence,
            reviewRequired: false,
            identityReviewStatus: "confirmed",
            memberCount: _0x450978.memberCount || _0x50ae75.memberCount,
            exemplarShotId: _0x450978.exemplarShotId || _0x50ae75.exemplarShotId,
            exemplarPersonId: _0x450978.exemplarPersonId || _0x50ae75.exemplarPersonId,
            ambiguousIdentityIds: _0x450978.ambiguousIdentityIds || [],
            notes: _0x450978.notes || _0x50ae75.notes
          };
        } else {
          return _0x50ae75;
        }
      });
      return {
        shots: _0x3a0424,
        sourceCharacters: _0x31b114,
        analysis: {
          status: "succeeded",
          modelId: _0x2d47eb.modelId,
          stats: {
            ...(_0x2d47eb.stats || {}),
            reviewCount: 0
          },
          error: ""
        }
      };
    } catch (_0x5f1ae8) {
      const _0x44d7fe = _0x3520eb.map(_0x59f589 => ({
        ..._0x59f589,
        people: _0x59f589.people.map(_0x149179 => ({
          ..._0x149179,
          identityReviewStatus: "confirmed",
          identityReviewRequired: false,
          identityMethod: "fallback"
        }))
      }));
      const _0x443624 = _0x5f1ae8?.message || "跨镜头人物身份分析失败";
      showToast(_0x443624 + "；已保留逐镜头人物，可按需拆分纠正。", "warn");
      return {
        shots: _0x44d7fe,
        sourceCharacters: a1098_0x39c187(_0x44d7fe, _0x479b40.sourceCharacters),
        analysis: {
          status: "failed",
          modelId: "",
          stats: {
            identityCount: _0x44d7fe.reduce((_0x1be21e, _0x35daac) => _0x1be21e + _0x35daac.people.length, 0),
            reviewCount: 0
          },
          error: _0x443624
        }
      };
    }
  }
  async function _0x4d3ee0(_0x2d3d17, _0x44accd, _0x5b6713, _0x2fa349) {
    const _0x32770a = await runSmartClip({
      source: _0x2d3d17.videoRef,
      options: {
        mode: _0x479b40.settings.smartClipMode,
        fps: _0x479b40.settings.smartClipFps,
        unlimitedSegments: true,
        ...(_0x44accd === "skip" ? {
          preserveWholeVideo: true
        } : {})
      },
      signal: _0x5b6713,
      onProgress: _0xba51dd => {
        const _0x31cf13 = Number(_0xba51dd?.progress);
        const _0x9138dc = Number(_0xba51dd?.pct);
        const _0xef95ec = Number.isFinite(_0x31cf13) ? _0x31cf13 : Number.isFinite(_0x9138dc) ? _0x9138dc / 100 : 0;
        const _0x553b4b = _0xba51dd?.phase === "keyframes" ? 45 : 5;
        const _0x328884 = Math.min(88, Math.round(_0x553b4b + _0xef95ec * 40));
        const _0x3de3ce = Math.round((_0x2fa349 + _0x328884 / 100) / _0x479b40.sources.length * 90);
        _0x5cae27({
          ..._0x479b40,
          sources: _0x479b40.sources.map(_0x385fbf => _0x385fbf.id === _0x2d3d17.id ? {
            ..._0x385fbf,
            processingStatus: _0xba51dd?.phase === "keyframes" ? "extracting-keyframes" : "cutting",
            processingProgress: _0x328884
          } : _0x385fbf),
          workspace: {
            ..._0x479b40.workspace,
            sourceAnalysis: {
              status: "cutting",
              progress: _0x3de3ce
            }
          }
        }, {
          persist: false,
          renderWorkspace: false
        });
      }
    });
    if (!_0x32770a?.shotBundles?.length) {
      throw new Error(resolveSmartClipFailureMessage(_0x32770a));
    }
    return _0x32770a.shotBundles.map((_0x31e397, _0x6014f0) => {
      const _0x53fc78 = normalizeText(_0x31e397.clipRef);
      return {
        id: _0x2d3d17.id + "-" + (_0x31e397.id || "shot-" + (_0x6014f0 + 1)),
        sourceId: _0x2d3d17.id,
        index: _0x6014f0,
        startTimeSec: _0x31e397.start,
        endTimeSec: _0x31e397.end,
        durationSec: _0x31e397.duration,
        sourceVideoRef: _0x2d3d17.videoRef,
        videoRef: _0x53fc78,
        keyframeRef: _0x31e397.keyframeRef,
        keyframeIndex: _0x31e397.keyframeIndex,
        keyframeTimeSec: _0x31e397.keyframeTimeSec,
        personDetection: _0x31e397.personDetection,
        outputFps: _0x31e397.fps || 24,
        materializationStatus: _0x53fc78 ? "succeeded" : "pending",
        materializationProgress: _0x53fc78 ? 100 : 0,
        people: [],
        analysisStatus: _0x31e397.keyframeRef ? "running" : "failed",
        reviewRequired: true,
        generationStatus: "pending",
        error: (_0x31e397.errors || []).map(_0x197d86 => _0x197d86?.message).filter(Boolean).join("；")
      };
    });
  }
  async function _0x168bc2({
    mode = "cut"
  } = {}) {
    const _0x259ad3 = _0x479b40.sources.filter(_0x3be468 => _0x3be468.videoRef);
    if (!_0x259ad3.length) {
      showToast("请先加入视频。", "warn");
      return {
        ok: false,
        reason: "missing-source"
      };
    }
    if (_0x1ccd62) {
      return {
        ok: false,
        reason: "already-running"
      };
    }
    _0x51132b = "project";
    _0x1ccd62 = new AbortController();
    const _0x26f1b1 = _0x1ccd62.signal;
    _0x5cae27({
      ..._0x479b40,
      status: "analyzing",
      settings: {
        ..._0x479b40.settings,
        processingMode: mode
      },
      workspace: {
        ..._0x479b40.workspace,
        view: "project",
        step: 1,
        sourceAnalysis: {
          status: mode === "skip" ? "extracting-keyframes" : "cutting",
          progress: 3
        }
      },
      sources: _0x479b40.sources.map(_0x257694 => _0x257694.videoRef ? {
        ..._0x257694,
        processingStatus: mode === "skip" ? "extracting-keyframes" : "cutting",
        processingProgress: 3,
        error: ""
      } : _0x257694)
    });
    showToast(mode === "skip" ? "已进入素材设定，正在后台扫描完整视频并检测人物关键帧。" : "已进入素材设定，正在后台分析镜头并检测人物关键帧。", "info");
    try {
      const _0x20d754 = [];
      for (let _0x4256a7 = 0; _0x4256a7 < _0x259ad3.length; _0x4256a7 += 1) {
        if (_0x26f1b1.aborted) {
          return {
            ok: false,
            reason: "cancelled"
          };
        }
        const _0x587d3e = _0x259ad3[_0x4256a7];
        const _0x23fbd6 = await _0x4d3ee0(_0x587d3e, mode, _0x26f1b1, _0x4256a7);
        for (const _0x1791c2 of _0x23fbd6) {
          const _0x5a5539 = await _0x4adfc7(_0x1791c2);
          _0x20d754.push(_0x5a5539);
        }
        _0x5cae27({
          ..._0x479b40,
          shots: [..._0x20d754],
          sources: _0x479b40.sources.map(_0x245a9a => _0x245a9a.id === _0x587d3e.id ? {
            ..._0x245a9a,
            processingStatus: "ready",
            processingProgress: 100,
            error: ""
          } : _0x245a9a),
          sourceCharacters: a1098_0x39c187(_0x20d754, _0x479b40.sourceCharacters),
          workspace: {
            ..._0x479b40.workspace,
            selectedShotId: _0x20d754[0]?.id || "",
            sourceAnalysis: {
              status: "detecting",
              progress: Math.round((_0x4256a7 + 1) / _0x259ad3.length * 100)
            }
          }
        }, {
          renderWorkspace: false
        });
      }
      _0x5cae27({
        ..._0x479b40,
        shots: _0x20d754,
        workspace: {
          ..._0x479b40.workspace,
          sourceAnalysis: {
            status: "identifying",
            progress: 94
          },
          identityAnalysis: {
            status: "running",
            modelId: "",
            stats: {},
            error: ""
          }
        }
      }, {
        persist: false,
        renderWorkspace: false
      });
      const _0x2da261 = await _0x35a66f(_0x20d754);
      const _0x1a510 = _0x2da261.shots;
      _0x5cae27({
        ..._0x479b40,
        shots: _0x1a510,
        sourceCharacters: _0x2da261.sourceCharacters,
        workspace: {
          ..._0x479b40.workspace,
          step: 1,
          selectedShotId: _0x1a510[0]?.id || "",
          sourceAnalysis: {
            status: "identifying",
            progress: 96
          },
          identityAnalysis: _0x2da261.analysis
        }
      }, {
        persist: false,
        renderWorkspace: false
      });
      const _0x174ded = await _0x5f123f({
        notify: false,
        renderWorkspace: false
      });
      if (!_0x174ded.ok) {
        throw new Error(_0x174ded.failures?.map(_0x1e5df4 => _0x1e5df4.message).filter(Boolean).join("；") || "镜头固定帧率处理失败");
      }
      await _0x4442f8({
        expectedProjectId: _0x479b40.id,
        renderWorkspace: false
      });
      _0x5cae27({
        ..._0x479b40,
        status: "character_mapping",
        workspace: {
          ..._0x479b40.workspace,
          sourceAnalysis: {
            status: "ready",
            progress: 100
          },
          identityAnalysis: _0x2da261.analysis
        }
      }, {
        renderWorkspace: false
      });
      const _0x57a594 = Number(_0x2da261.analysis?.stats?.identityCount) || 0;
      showToast("视频处理完成，共 " + _0x1a510.length + " 个镜头、" + _0x57a594 + " 个主要人物。", "success");
      return {
        ok: true,
        project: _0x461c5c()
      };
    } catch (_0x58402b) {
      if (_0x26f1b1.aborted) {
        return {
          ok: false,
          reason: "cancelled"
        };
      }
      const _0x232508 = normalizeText(_0x58402b?.message) || "视频处理失败";
      _0x5cae27({
        ..._0x479b40,
        workspace: {
          ..._0x479b40.workspace,
          sourceAnalysis: {
            status: "failed",
            progress: 100
          }
        },
        sources: _0x479b40.sources.map(_0x4bc89f => _0x4bc89f.videoRef && _0x4bc89f.processingStatus !== "ready" ? {
          ..._0x4bc89f,
          processingStatus: "failed",
          processingProgress: 100,
          error: _0x232508
        } : _0x4bc89f)
      }, {
        renderWorkspace: false
      });
      showToast(_0x232508, "error");
      throw _0x58402b;
    } finally {
      if (_0x1ccd62?.signal === _0x26f1b1) {
        _0x1ccd62 = null;
      }
    }
  }
  async function _0x2d39b7({
    mode = _0x479b40.settings.smartClipMode,
    fps = _0x479b40.settings.smartClipFps
  } = {}) {
    const _0xab0956 = "shot-cut-detection";
    if (_0x14c38c.has(_0xab0956)) {
      throw new Error("智能检测正在运行，请稍候");
    }
    const _0x510231 = _0x479b40.sources.filter(_0x452b4f => normalizeText(_0x452b4f?.videoRef) && _0x479b40.shots.some(_0x25a9de => normalizeText(_0x25a9de?.sourceId) === normalizeText(_0x452b4f?.id)));
    if (!_0x510231.length) {
      throw new Error("当前时间轴缺少可重新检测的原视频");
    }
    const _0x1db057 = cloneJson(_0x479b40.shots);
    _0x14c38c.add(_0xab0956);
    try {
      const _0x4c701e = [];
      for (const _0xcf4eb1 of _0x510231) {
        const _0x3e89e4 = await runSmartClip({
          source: _0xcf4eb1.videoRef,
          options: {
            mode: mode,
            fps: fps,
            unlimitedSegments: true
          }
        });
        if (!_0x3e89e4?.shotBundles?.length) {
          throw new Error("视频「" + (_0xcf4eb1.fileName || _0xcf4eb1.id) + "」未检测到可用片段");
        }
        _0x4c701e.push(...buildPersonReplacementDetectedShotCutRanges({
          source: _0xcf4eb1,
          shots: _0x1db057,
          shotBundles: _0x3e89e4.shotBundles,
          fps: fps
        }));
      }
      return {
        ranges: _0x4c701e
      };
    } finally {
      _0x14c38c.delete(_0xab0956);
    }
  }
  function _0x57eb8e({
    shotId: _0x8492e6,
    bbox: _0x37c6d5
  } = {}) {
    const _0x8873cc = normalizeText(_0x8492e6);
    const _0x306a72 = _0x479b40.shots.find(_0x2e2625 => _0x2e2625.id === _0x8873cc);
    const {
      x: _0xc347d8,
      y: _0x3f353f,
      width: _0x4a49aa,
      height: _0x3d17c8
    } = normalizePersonReplacementBoundingBox(_0x37c6d5 && typeof _0x37c6d5 === "object" ? _0x37c6d5 : {});
    if (!_0x306a72 || _0x4a49aa <= 0 || _0x3d17c8 <= 0) {
      return null;
    }
    const _0x3a4029 = createId(_0x8873cc + "-manual-person");
    const _0x1f96e3 = createId("source-character-manual");
    const _0x2553d6 = {
      id: _0x3a4029,
      sourceCharacterId: _0x1f96e3,
      targetCharacterId: "",
      targetAppearanceId: "",
      label: formatPersonReplacementPersonLabel(_0x306a72.people.length),
      detectionClass: "character",
      detectionMethod: "manual",
      bbox: {
        x: _0xc347d8,
        y: _0x3f353f,
        width: _0x4a49aa,
        height: _0x3d17c8
      },
      detectionConfidence: 0,
      identityConfidence: 1,
      identityMatchSimilarity: 1,
      identityReviewStatus: "confirmed",
      identityReviewRequired: false,
      identityMethod: "manual",
      ambiguousIdentityIds: [],
      orientation: "front",
      orientationConfidence: 1,
      orientationModelId: "",
      occlusion: "none",
      notes: "用户手动画框的可替换主体"
    };
    const _0x59cb40 = _0x479b40.shots.map(_0x189424 => _0x189424.id === _0x8873cc ? {
      ..._0x189424,
      people: orderAndRelabelPersonReplacementPeople([..._0x189424.people, _0x2553d6]),
      reviewRequired: true
    } : _0x189424);
    const _0x49fe71 = _0x5cae27({
      ..._0x479b40,
      shots: _0x59cb40,
      sourceCharacters: a1098_0x39c187(_0x59cb40, _0x479b40.sourceCharacters)
    });
    showToast("已添加可替换主体，请将目标形象拖入框内。", "success");
    return {
      project: _0x49fe71
    };
  }
  function _0x3b4b3c({
    shotId: _0x52a1d3,
    updates = []
  } = {}) {
    const _0x7b9719 = normalizeText(_0x52a1d3);
    const _0x472649 = _0x479b40.shots.find(_0x3908bc => _0x3908bc.id === _0x7b9719);
    if (!_0x472649) {
      return null;
    }
    const _0x21f2fc = new Map(_0x472649.people.map(_0x1bfae0 => [_0x1bfae0.id, _0x1bfae0]));
    const _0xb47a71 = new Map();
    (Array.isArray(updates) ? updates : []).forEach(_0x482830 => {
      const _0x3a7c86 = normalizeText(_0x482830?.personId);
      if (!_0x21f2fc.has(_0x3a7c86)) {
        return;
      }
      const _0x2cf9d9 = {};
      const _0x582d47 = normalizePersonReplacementBoundingBox(_0x482830?.bbox && typeof _0x482830.bbox === "object" ? _0x482830.bbox : {});
      if (_0x582d47.width > 0 && _0x582d47.height > 0) {
        _0x2cf9d9.bbox = _0x582d47;
      }
      if (Object.hasOwn(_0x482830 || {}, "replacementScope")) {
        _0x2cf9d9.replacementScope = normalizePersonReplacementScope(_0x482830.replacementScope);
      }
      if (Object.keys(_0x2cf9d9).length) {
        _0xb47a71.set(_0x3a7c86, _0x2cf9d9);
      }
    });
    if (!_0xb47a71.size) {
      return null;
    }
    const _0x559429 = _0x479b40.shots.map(_0x453557 => _0x453557.id === _0x7b9719 ? {
      ..._0x453557,
      people: orderAndRelabelPersonReplacementPeople(_0x453557.people.map(_0x12012a => {
        const _0x45f1f0 = _0xb47a71.get(_0x12012a.id);
        if (!_0x45f1f0) {
          return _0x12012a;
        }
        return {
          ..._0x12012a,
          ...(_0x45f1f0.replacementScope ? {
            replacementScope: _0x45f1f0.replacementScope
          } : {}),
          ...(_0x45f1f0.bbox ? {
            bbox: _0x45f1f0.bbox,
            locator: {
              ..._0x12012a.locator,
              bbox: _0x45f1f0.bbox
            }
          } : {})
        };
      }))
    } : _0x453557);
    const _0x536a6f = _0x5cae27({
      ..._0x479b40,
      shots: _0x559429,
      sourceCharacters: a1098_0x39c187(_0x559429, _0x479b40.sourceCharacters)
    });
    return {
      project: _0x536a6f
    };
  }
  function _0x339787({
    shotId: _0x444197,
    personIds = []
  } = {}) {
    const _0x2687d1 = normalizeText(_0x444197);
    const _0x487c77 = _0x479b40.shots.find(_0x580a77 => _0x580a77.id === _0x2687d1);
    const _0x221cdf = new Set((Array.isArray(personIds) ? personIds : []).map(normalizeText).filter(Boolean));
    const _0x436784 = _0x487c77?.people.filter(_0x40aaa9 => _0x221cdf.has(_0x40aaa9.id)) || [];
    if (!_0x436784.length) {
      return null;
    }
    const _0x239bac = new Set(_0x436784.map(_0xc8c4a5 => _0xc8c4a5.id));
    const _0xb11a35 = new Set(_0x436784.map(_0x57a017 => normalizeText(_0x57a017.sourceCharacterId)).filter(Boolean));
    const _0x5fa958 = _0x479b40.shots.map(_0x217842 => _0x217842.id === _0x2687d1 ? {
      ..._0x217842,
      people: orderAndRelabelPersonReplacementPeople(_0x217842.people.filter(_0x37d201 => !_0x239bac.has(_0x37d201.id)))
    } : _0x217842);
    const _0x5eaf19 = new Set();
    _0x5fa958.forEach(_0x291ead => _0x291ead.people.forEach(_0x37d81e => {
      const _0x17559 = normalizeText(_0x37d81e.sourceCharacterId);
      if (_0x17559) {
        _0x5eaf19.add(_0x17559);
      }
    }));
    const _0x3767d7 = _0x479b40.sourceCharacters.map(_0x205db2 => _0x239bac.has(normalizeText(_0x205db2.exemplarPersonId)) ? {
      ..._0x205db2,
      exemplarShotId: "",
      exemplarPersonId: ""
    } : _0x205db2);
    const _0x13e2a2 = _0x5cae27({
      ..._0x479b40,
      shots: _0x5fa958,
      mappings: _0x479b40.mappings.filter(_0x4b0288 => {
        const _0x233d5b = normalizeText(_0x4b0288.sourceCharacterId);
        return !_0xb11a35.has(_0x233d5b) || _0x5eaf19.has(_0x233d5b);
      }),
      sourceCharacters: a1098_0x39c187(_0x5fa958, _0x3767d7)
    });
    showToast(_0x436784.length > 1 ? "已删除 " + _0x436784.length + " 个人物框。" : "已删除该人物框。", "success");
    return {
      project: _0x13e2a2
    };
  }
  async function _0x3152c5({
    ranges = [],
    replaceTimeline = false,
    selectedShotId: _0x1ce978 = "",
    renderWorkspace = true,
    notify = true,
    revision: _0x24cd63 = 0
  } = {}) {
    const _0xe651a1 = _0x50bb60.acceptRevision(_0x24cd63);
    const _0x55ee92 = "shot-cut-timeline:" + _0xe651a1;
    const _0x326fbc = normalizeText(_0x479b40.id);
    const _0x1aea90 = normalizePersonReplacementShotCutRanges(_0x479b40.shots, ranges, {
      allowTimelineReplacement: replaceTimeline === true
    });
    const _0x110c06 = new Map(_0x479b40.shots.map(_0x37876b => [normalizeText(_0x37876b.id), _0x37876b]));
    const _0x4ec834 = new Set(_0x1aea90.filter(_0x1fedf9 => normalizeText(_0x1fedf9.originShotId) && !_0x110c06.has(normalizeText(_0x1fedf9.shotId))).map(_0x1c1a76 => normalizeText(_0x1c1a76.originShotId)));
    const _0x35eb1e = _0x1aea90.length !== _0x479b40.shots.length || _0x1aea90.some(_0x27edf5 => !_0x110c06.has(normalizeText(_0x27edf5.shotId)));
    const _0x351af7 = _0x1aea90.filter(_0x1ecd35 => {
      const _0x3faa13 = _0x110c06.get(_0x1ecd35.shotId) || _0x110c06.get(_0x1ecd35.originShotId);
      const _0x1e8779 = normalizeText(_0x1ecd35.keyframeRef);
      const _0x4c912a = Boolean(_0x1e8779 && (_0x1e8779 !== normalizeText(_0x3faa13?.keyframeRef) || Math.abs(Number(_0x1ecd35.keyframeTimeSec) - Number(_0x3faa13?.keyframeTimeSec)) > a1098_0x4fcd89));
      const _0x1f66fa = Boolean(_0x1e8779 && Boolean(_0x1ecd35.keyframeManuallySelected) !== Boolean(_0x3faa13?.keyframeManuallySelected));
      return !_0x3faa13 || !_0x110c06.has(_0x1ecd35.shotId) || Math.abs(_0x1ecd35.startSec - Number(_0x3faa13.startTimeSec)) > a1098_0x4fcd89 || Math.abs(_0x1ecd35.endSec - Number(_0x3faa13.endTimeSec)) > a1098_0x4fcd89 || Boolean(_0x1ecd35.isReversed) !== Boolean(_0x3faa13.isReversed) || Boolean(_0x1ecd35.isReversed) !== Boolean(_0x3faa13.materializedIsReversed) || _0x4c912a || _0x1f66fa;
    });
    const _0x38fa7a = new Set(_0x351af7.map(_0x1d1ad9 => _0x1d1ad9.shotId));
    if (!_0x351af7.length) {
      showToast("镜头切口没有变化。", "info");
      return {
        project: _0x461c5c(),
        changedShotCount: 0
      };
    }
    const _0x1de75f = new Map();
    _0x479b40.shots.forEach(_0x147123 => _0x147123.people.forEach(_0x3fecf1 => {
      const _0x1bd700 = normalizeText(_0x3fecf1.sourceCharacterId);
      if (!_0x1bd700) {
        return;
      }
      const _0x4a2d2d = normalizeText(_0x3fecf1.targetCharacterId);
      const _0x211ae2 = normalizeText(_0x3fecf1.targetAppearanceId);
      if (_0x4a2d2d || _0x211ae2) {
        _0x1de75f.set(_0x1bd700, {
          targetCharacterId: _0x4a2d2d,
          targetAppearanceId: _0x211ae2
        });
      }
    }));
    _0x14c38c.add(_0x55ee92);
    if (notify) {
      showToast("正在更新 " + _0x38fa7a.size + " 个相邻片段。", "info");
    }
    try {
      const _0x243eb2 = [];
      let _0x301a35 = false;
      for (let _0x13a05a = 0; _0x13a05a < _0x1aea90.length; _0x13a05a += 1) {
        const _0x41cf8f = _0x1aea90[_0x13a05a];
        const _0x5ac958 = _0x110c06.get(_0x41cf8f.shotId) || _0x110c06.get(_0x41cf8f.originShotId);
        const _0x3a0ff7 = !_0x110c06.has(_0x41cf8f.shotId);
        const _0x4b0263 = _0x4ec834.has(normalizeText(_0x41cf8f.originShotId || _0x41cf8f.shotId));
        if (!_0x5ac958) {
          throw new Error("片段 " + (_0x41cf8f.shotId || _0x13a05a + 1) + " 缺少原始片段");
        }
        if (!_0x38fa7a.has(_0x41cf8f.shotId)) {
          _0x243eb2.push({
            ..._0x5ac958,
            index: _0x13a05a
          });
          continue;
        }
        const _0x179f2a = _0x479b40.sources.find(_0x5b29f0 => _0x5b29f0.id === _0x5ac958.sourceId);
        const _0x313315 = normalizeText(_0x5ac958.sourceVideoRef || _0x179f2a?.videoRef);
        if (!_0x313315) {
          throw new Error("片段 " + (_0x5ac958.title || _0x13a05a + 1) + " 缺少原始视频");
        }
        const _0x18d327 = [16, 24, 30].includes(Math.round(Number(_0x5ac958.outputFps))) ? Math.round(Number(_0x5ac958.outputFps)) : 24;
        const {
          videoRef: _0x4319f6,
          reverseChanged: _0x38825c,
          videoRefIsCropped: _0x2b930b
        } = await materializePersonReplacementShotPlayback({
          currentShot: _0x5ac958,
          range: _0x41cf8f,
          isNewShot: _0x3a0ff7,
          sourceVideoRef: _0x313315,
          outputFps: _0x18d327,
          epsilonSec: a1098_0x4fcd89,
          enqueueMediaTask: enqueueMediaTask,
          resolveMediaRef: resolveMediaRef
        });
        const _0x49921a = normalizeText(_0x41cf8f.keyframeRef);
        const _0xc19f5b = Boolean(_0x49921a);
        const _0x55a313 = Number(_0x5ac958.keyframeTimeSec);
        const _0x5c3697 = Boolean(!_0x38825c && normalizeText(_0x5ac958.keyframeRef) && (!Number.isFinite(_0x55a313) || _0x55a313 >= _0x41cf8f.startSec - a1098_0x4fcd89 && _0x55a313 < _0x41cf8f.endSec + a1098_0x4fcd89));
        let _0x5abf08 = _0xc19f5b ? _0x49921a : _0x5c3697 ? normalizeText(_0x5ac958.keyframeRef) : "";
        if (!_0x5abf08) {
          const _0xb4f55e = await fetchFirstFrame(_0x4319f6, {
            assetId: _0x479b40.id,
            nodeId: _0x41cf8f.shotId || _0x5ac958.id
          });
          _0x5abf08 = resolveMediaRef(_0xb4f55e);
        }
        if (!_0x5abf08) {
          throw new Error("镜头切口更新后首帧提取失败");
        }
        const _0x2be9d1 = _0xc19f5b && (_0x49921a !== normalizeText(_0x5ac958.keyframeRef) || Math.abs(Number(_0x41cf8f.keyframeTimeSec) - Number(_0x5ac958.keyframeTimeSec)) > a1098_0x4fcd89);
        const _0x2cb3ad = {
          ..._0x5ac958,
          id: _0x41cf8f.shotId,
          title: _0x3a0ff7 && _0x5ac958.title ? _0x5ac958.title + " · " + (_0x13a05a + 1) : _0x5ac958.title,
          index: _0x13a05a,
          startTimeSec: _0x41cf8f.startSec,
          endTimeSec: _0x41cf8f.endSec,
          durationSec: _0x41cf8f.endSec - _0x41cf8f.startSec,
          sourceVideoRef: _0x313315,
          videoRef: _0x4319f6,
          videoRefIsCropped: _0x2b930b,
          isReversed: _0x41cf8f.isReversed === true,
          materializedIsReversed: _0x41cf8f.isReversed === true,
          keyframeRef: _0x5abf08,
          keyframeIndex: !_0x2be9d1 && _0x5c3697 ? _0x5ac958.keyframeIndex : 0,
          keyframeTimeSec: _0xc19f5b ? _0x41cf8f.keyframeTimeSec : _0x5c3697 ? _0x5ac958.keyframeTimeSec : _0x41cf8f.isReversed === true ? _0x41cf8f.endSec : _0x41cf8f.startSec,
          keyframeManuallySelected: _0xc19f5b ? _0x41cf8f.keyframeManuallySelected === true : _0x5c3697 ? _0x5ac958.keyframeManuallySelected === true : false,
          frame: _0xc19f5b && _0x41cf8f.frame ? {
            ..._0x41cf8f.frame
          } : _0x5ac958.frame,
          outputFps: _0x18d327,
          materializationStatus: "succeeded",
          materializationProgress: 100,
          replacementImage: {
            results: [],
            activeIndex: 0
          },
          replacementImageRef: "",
          ...(_0x4b0263 ? {
            replacementVideo: {
              results: [],
              activeIndex: 0
            },
            resultVideoRef: "",
            generationStatus: "pending"
          } : {}),
          error: ""
        };
        if (!_0x2be9d1 && _0x5c3697) {
          _0x243eb2.push({
            ..._0x2cb3ad,
            people: _0x5ac958.people.map(_0x6f3513 => ({
              ..._0x6f3513
            })),
            analysisStatus: _0x5ac958.analysisStatus,
            reviewRequired: _0x5ac958.reviewRequired
          });
        } else {
          _0x301a35 = true;
          _0x243eb2.push(await _0x4adfc7({
            ..._0x2cb3ad,
            people: [],
            analysisStatus: "running",
            reviewRequired: true
          }));
        }
      }
      const _0x12d2f1 = _0x301a35 ? await _0x35a66f(_0x243eb2) : {
        shots: _0x243eb2,
        sourceCharacters: _0x479b40.sourceCharacters,
        analysis: _0x479b40.workspace.identityAnalysis
      };
      const _0x1f1f04 = _0x12d2f1.shots.map(_0x1f2742 => ({
        ..._0x1f2742,
        people: _0x1f2742.people.map(_0xcc234f => {
          const _0x557740 = _0x1de75f.get(normalizeText(_0xcc234f.sourceCharacterId));
          if (_0x557740) {
            return {
              ..._0xcc234f,
              targetCharacterId: _0x557740.targetCharacterId,
              targetAppearanceId: _0x557740.targetAppearanceId
            };
          } else {
            return _0xcc234f;
          }
        })
      }));
      const _0x554850 = normalizeText(_0x1ce978);
      const _0x209935 = _0x1f1f04.some(_0x2f26b6 => normalizeText(_0x2f26b6.id) === _0x554850) ? _0x554850 : _0x1f1f04.some(_0x4b7a74 => normalizeText(_0x4b7a74.id) === normalizeText(_0x479b40.workspace.selectedShotId)) ? _0x479b40.workspace.selectedShotId : _0x1f1f04[0]?.id || "";
      if (_0x358ed5 || !_0x50bb60.isCurrent(_0xe651a1) || normalizeText(_0x479b40.id) !== _0x326fbc) {
        return {
          project: _0x461c5c(),
          changedShotCount: 0,
          stale: true
        };
      }
      const _0x539f9f = {
        ..._0x479b40,
        shots: _0x1f1f04,
        sourceCharacters: a1098_0x39c187(_0x1f1f04, _0x12d2f1.sourceCharacters),
        workspace: {
          ..._0x479b40.workspace,
          selectedShotId: _0x209935,
          identityAnalysis: _0x12d2f1.analysis,
          imageGeneration: {
            status: "idle",
            shotId: "",
            error: ""
          },
          imageGenerationsByShotId: {},
          videoGeneration: {
            status: "idle",
            shotId: "",
            error: ""
          },
          videoGenerationsByShotId: {},
          videoPreparation: {
            status: "idle",
            progress: 0,
            error: ""
          }
        }
      };
      const _0x1deb24 = _0x5cae27(_0x35eb1e ? transitionPersonReplacementOutput(_0x539f9f, {
        type: PERSON_REPLACEMENT_OUTPUT_TRANSITIONS.INVALIDATE
      }) : _0x539f9f, {
        renderWorkspace: renderWorkspace
      });
      if (notify) {
        showToast("已更新 " + _0x38fa7a.size + " 个片段的切口。", "success");
      }
      return {
        project: _0x1deb24,
        changedShotCount: _0x38fa7a.size
      };
    } finally {
      _0x14c38c.delete(_0x55ee92);
    }
  }
  const _0xd21de3 = createPersonReplacementShotReverseOperation({
    coordinator: _0x50bb60,
    getProject: () => _0x479b40,
    setProject: _0x5cae27,
    snapshot: _0x461c5c,
    showToast: showToast,
    updateShotCutRanges: _0x3152c5,
    isDestroyed: () => _0x358ed5
  });
  function _0x4c8915({
    sourceCharacterIds = []
  } = {}) {
    try {
      const _0x3a0968 = mergePersonReplacementSourceCharacters(_0x479b40, {
        sourceCharacterIds: sourceCharacterIds
      });
      const _0x52fedf = _0x5cae27({
        ..._0x3a0968,
        sourceCharacters: a1098_0x39c187(_0x3a0968.shots, _0x3a0968.sourceCharacters),
        workspace: {
          ..._0x3a0968.workspace,
          selectedIdentityIds: []
        }
      });
      showToast("所选人物身份已合并。", "success");
      return {
        project: _0x52fedf
      };
    } catch (_0x5476b3) {
      showToast(_0x5476b3?.message || "人物身份合并失败", "warn");
      return null;
    }
  }
  function _0x531fdf({
    sourceCharacterId: _0x27cc2c,
    shotId: _0x576621,
    personId: _0x21e295
  } = {}) {
    try {
      const _0x33cc99 = splitPersonReplacementSourceCharacter(_0x479b40, {
        sourceCharacterId: _0x27cc2c,
        occurrences: [{
          shotId: _0x576621,
          personId: _0x21e295
        }],
        newSourceCharacterId: createId("source-character-manual")
      });
      const _0x5c9f58 = _0x5cae27({
        ..._0x33cc99,
        sourceCharacters: a1098_0x39c187(_0x33cc99.shots, _0x33cc99.sourceCharacters),
        workspace: {
          ..._0x33cc99.workspace,
          selectedIdentityIds: []
        }
      });
      showToast("当前人物框已拆分为独立人物。", "success");
      return {
        project: _0x5c9f58
      };
    } catch (_0x1a18f9) {
      showToast(_0x1a18f9?.message || "人物身份拆分失败", "warn");
      return null;
    }
  }
  function _0x2819af({
    sourceCharacterId: _0x4feb44,
    targetSourceCharacterId: _0xad6f62,
    shotId: _0x418767,
    personId: _0x19c6e1,
    label: _0x4661ed,
    orientation: _0x5329a2,
    silent = false
  } = {}) {
    try {
      const _0x5c5a15 = normalizeText(_0x4661ed);
      const _0x482022 = normalizePersonReplacementOrientation(_0x5329a2);
      if (!_0x5c5a15) {
        throw new Error("请输入人物名称");
      }
      const _0x45a57e = confirmPersonReplacementSourceCharacter(_0x479b40, {
        sourceCharacterId: _0x4feb44,
        targetSourceCharacterId: _0xad6f62,
        shotId: _0x418767,
        personId: _0x19c6e1,
        label: _0x5c5a15,
        orientation: _0x482022 === "unknown" ? "" : _0x482022
      });
      const _0x1c1626 = _0x5cae27({
        ..._0x45a57e,
        sourceCharacters: a1098_0x39c187(_0x45a57e.shots, _0x45a57e.sourceCharacters)
      }, {
        sync: false
      });
      if (!silent) {
        showToast("人物身份已确认。", "success");
      }
      return {
        project: _0x1c1626
      };
    } catch (_0xb1a69c) {
      showToast(_0xb1a69c?.message || "人物身份确认失败", "warn");
      return null;
    }
  }
  function _0x331b47({
    characterId: _0x3282ec
  } = {}) {
    const _0xf36603 = normalizeText(_0x3282ec);
    if (!_0xf36603 || !_0x479b40.characters.some(_0x30f85e => _0x30f85e.id === _0xf36603)) {
      return null;
    }
    const _0x3b39df = _0x479b40.characters.filter(_0x16bb53 => _0x16bb53.id !== _0xf36603);
    const _0x6f359 = Object.fromEntries(Object.entries(_0x479b40.workspace.assetAppearanceIndexes || {}).filter(([_0x4e499b]) => _0x4e499b !== _0xf36603));
    const _0x171f3f = _0x5cae27({
      ..._0x479b40,
      characters: _0x3b39df,
      mappings: _0x479b40.mappings.filter(_0x239e60 => _0x239e60.targetCharacterId !== _0xf36603),
      shots: _0x479b40.shots.map(_0x38f8c2 => ({
        ..._0x38f8c2,
        people: _0x38f8c2.people.map(_0x5786b8 => _0x5786b8.targetCharacterId === _0xf36603 ? {
          ..._0x5786b8,
          targetCharacterId: "",
          targetAppearanceId: ""
        } : _0x5786b8)
      })),
      workspace: {
        ..._0x479b40.workspace,
        selectedCharacterId: _0x479b40.workspace.selectedCharacterId === _0xf36603 ? _0x3b39df[0]?.id || "" : _0x479b40.workspace.selectedCharacterId,
        selectedAssetIds: _0x479b40.workspace.selectedAssetIds.filter(_0x4dabf5 => _0x4dabf5 !== _0xf36603),
        assetAppearanceIndexes: _0x6f359
      }
    });
    showToast("人物卡片已删除。", "success");
    return {
      project: _0x171f3f
    };
  }
  function _0x365c59({
    sceneId: _0x3845a8
  } = {}) {
    const _0x385ecc = normalizeText(_0x3845a8);
    if (!_0x385ecc || !_0x479b40.scenes.some(_0xc5ede3 => _0xc5ede3.id === _0x385ecc)) {
      return null;
    }
    const _0x9240cf = _0x479b40.scenes.filter(_0x45a931 => _0x45a931.id !== _0x385ecc);
    const _0x349c4e = Object.fromEntries(Object.entries(_0x479b40.workspace.assetAppearanceIndexes || {}).filter(([_0x2e3bd1]) => _0x2e3bd1 !== _0x385ecc));
    const _0x354ce5 = _0x5cae27({
      ..._0x479b40,
      scenes: _0x9240cf,
      shots: _0x479b40.shots.map(_0x156e1d => normalizeText(_0x156e1d.sceneReference?.sceneId) === _0x385ecc ? {
        ..._0x156e1d,
        sceneReference: {
          sceneId: "",
          appearanceId: ""
        }
      } : _0x156e1d),
      workspace: {
        ..._0x479b40.workspace,
        selectedSceneId: _0x479b40.workspace.selectedSceneId === _0x385ecc ? _0x9240cf[0]?.id || "" : _0x479b40.workspace.selectedSceneId,
        selectedAssetIds: _0x479b40.workspace.selectedAssetIds.filter(_0x14c6b2 => _0x14c6b2 !== _0x385ecc),
        assetAppearanceIndexes: _0x349c4e
      }
    });
    showToast("场景卡片已删除。", "success");
    return {
      project: _0x354ce5
    };
  }
  function _0x763005({
    audioAssetId: _0xd54685
  } = {}) {
    const _0x577a30 = normalizeText(_0xd54685);
    const _0x4de3ed = _0x479b40.audioAssets.find(_0x1b857b => _0x1b857b.id === _0x577a30);
    if (!_0x4de3ed) {
      return null;
    }
    const _0x1576db = normalizeText(_0x4de3ed.sourceAssetId);
    const _0xe676ab = Math.max(0, Math.trunc(Number(_0x4de3ed.sourceItemIndex) || 0));
    const _0x110725 = _0x479b40.audioAssets.filter(_0x1f3879 => _0x1f3879.id !== _0x577a30);
    const _0x255dd4 = _0x479b40.characters.map(_0x48021c => {
      const _0xe3cc67 = _0x48021c.voiceReference;
      const _0x3ba4a7 = Boolean(_0xe3cc67 && (normalizeText(_0xe3cc67.libraryAssetId) === _0x577a30 || _0x1576db && normalizeText(_0xe3cc67.sourceAssetId) === _0x1576db && Math.max(0, Math.trunc(Number(_0xe3cc67.sourceItemIndex) || 0)) === _0xe676ab));
      if (_0x3ba4a7) {
        return {
          ..._0x48021c,
          voiceReference: null,
          voiceRef: ""
        };
      } else {
        return _0x48021c;
      }
    });
    const _0x50e20f = _0x5cae27({
      ..._0x479b40,
      audioAssets: _0x110725,
      characters: _0x255dd4,
      workspace: {
        ..._0x479b40.workspace,
        selectedAudioAssetId: _0x479b40.workspace.selectedAudioAssetId === _0x577a30 ? _0x110725[0]?.id || "" : _0x479b40.workspace.selectedAudioAssetId
      }
    });
    showToast("项目音频已移除。", "success");
    return {
      project: _0x50e20f
    };
  }
  async function _0x4e1755(_0x4e8f7b = [], _0x5defaa = "character") {
    const _0x1aaf12 = (Array.isArray(_0x4e8f7b) ? _0x4e8f7b : [_0x4e8f7b]).filter(Boolean);
    if (!_0x1aaf12.length || typeof _0xb16d1a !== "function") {
      return null;
    }
    const _0x28c69e = normalizeText(_0x479b40.id);
    const _0x366957 = [];
    for (const _0x23f808 of _0x1aaf12) {
      const _0x23560e = await _0xb16d1a(_0x23f808, _0x479b40.id);
      const _0x2631c2 = resolveMediaRef(_0x23560e);
      if (!_0x2631c2) {
        throw new Error("素材图片保存结果缺少可用地址");
      }
      if (normalizeText(_0x479b40.id) !== _0x28c69e) {
        return null;
      }
      _0x366957.push({
        file: _0x23f808,
        imageRef: _0x2631c2
      });
    }
    const _0xa4bebb = _0x5defaa === "scene";
    const _0x75c017 = _0xa4bebb ? "scenes" : "characters";
    const _0x215173 = Array.isArray(_0x479b40[_0x75c017]) ? _0x479b40[_0x75c017] : [];
    const _0x268f54 = new Set(_0x215173.map(_0x1b4cc5 => _0x1b4cc5.id));
    const _0x325722 = _0x366957.map(({
      file: _0x223f97,
      imageRef: _0xe8c3f7
    }, _0x2fa264) => {
      const _0x49e70a = _0x215173.length + _0x2fa264 + 1;
      let _0x2339a7 = _0x49e70a;
      const _0x1c3001 = _0xa4bebb ? "target-scene" : "target";
      while (_0x268f54.has(_0x1c3001 + "-" + _0x2339a7)) {
        _0x2339a7 += 1;
      }
      const _0x67f26e = _0x1c3001 + "-" + _0x2339a7;
      const _0x76a42e = _0x67f26e + "-appearance-1";
      _0x268f54.add(_0x67f26e);
      const _0x15667f = _0xa4bebb ? "场景" : "人物";
      const _0x1784a9 = _0xa4bebb ? "目标场景 " + _0x49e70a : "目标人物 " + _0x49e70a;
      const _0x2e3c1d = {
        id: _0x67f26e,
        kind: _0x5defaa,
        role: _0x15667f,
        name: createUploadedAssetName(_0x223f97.name, _0x1784a9),
        appearances: [{
          id: _0x76a42e,
          name: _0xa4bebb ? "场景图" : "基础形象",
          imageUrl: _0xe8c3f7,
          prompt: "",
          occurrences: "当前项目"
        }],
        baseAppearanceId: _0x76a42e,
        description: ""
      };
      if (!_0xa4bebb) {
        _0x2e3c1d.voiceReference = null;
      }
      return _0x2e3c1d;
    });
    const _0x29a416 = _0x325722.at(-1);
    return {
      project: _0x5cae27({
        ..._0x479b40,
        [_0x75c017]: [..._0x215173, ..._0x325722],
        workspace: {
          ..._0x479b40.workspace,
          ...(_0xa4bebb ? {
            selectedSceneId: _0x29a416?.id || _0x479b40.workspace.selectedSceneId
          } : {
            selectedCharacterId: _0x29a416?.id || _0x479b40.workspace.selectedCharacterId
          })
        }
      })
    };
  }
  function _0x3c35b4(_0xf1d5f2 = []) {
    return _0x4e1755(_0xf1d5f2, "character");
  }
  function _0x44a8e8(_0x528eac = []) {
    return _0x4e1755(_0x528eac, "scene");
  }
  async function _0xa33c34(_0x5166f7 = []) {
    const _0x2153d6 = (Array.isArray(_0x5166f7) ? _0x5166f7 : [_0x5166f7]).filter(Boolean);
    if (!_0x2153d6.length || typeof _0xb16d1a !== "function") {
      return null;
    }
    if (typeof saveAssetPackageItem !== "function") {
      throw new Error("总素材服务尚未初始化。");
    }
    const _0x2591ae = normalizeText(_0x479b40.id);
    const _0xfab51b = [];
    const _0xb86a7f = [];
    for (const _0x1ead23 of _0x2153d6) {
      const _0x4540e1 = await _0xb16d1a(_0x1ead23, _0x2591ae);
      const _0x403516 = resolveMediaRef(_0x4540e1);
      if (!_0x403516) {
        throw new Error("音频保存结果缺少可用地址");
      }
      if (normalizeText(_0x479b40.id) !== _0x2591ae) {
        return null;
      }
      const _0x474fab = createId("person-replacement-audio");
      const _0x289a29 = createUploadedAssetName(_0x1ead23.name, "未命名音频");
      const _0x3a7656 = await saveAssetPackageItem({
        packageKey: "person-replacement-audio:" + _0x2591ae,
        packageName: (normalizeText(_0x479b40.title) || "未命名人物替换项目") + " · 音频素材",
        category: "替换工作室",
        itemKey: _0x474fab,
        itemName: _0x289a29,
        audio: {
          ...(_0x4540e1 && typeof _0x4540e1 === "object" ? _0x4540e1 : {}),
          audioUrl: _0x403516
        },
        metadata: {
          sourceKind: "person-replacement-workspace",
          sourceProjectId: _0x2591ae
        },
        itemMetadata: {
          sourceKind: "person-replacement-workspace",
          sourceProjectId: _0x2591ae,
          sourceAudioId: _0x474fab
        }
      });
      if (normalizeText(_0x479b40.id) !== _0x2591ae) {
        return null;
      }
      const _0x527013 = normalizeText(_0x3a7656?.assetId);
      const _0x383762 = Math.max(0, Math.trunc(Number(_0x3a7656?.itemIndex) || 0));
      if (_0x527013) {
        _0xfab51b.push({
          assetId: _0x527013,
          itemIndex: _0x383762
        });
        _0xb86a7f.push({
          assetId: _0x527013,
          itemIndex: _0x383762,
          type: "audio",
          assetName: (normalizeText(_0x479b40.title) || "未命名人物替换项目") + " · 音频素材",
          name: _0x289a29,
          savedName: _0x289a29,
          url: _0x403516,
          durationSec: Math.max(0, Number(_0x4540e1?.durationSec) || 0),
          waveformLocalPath: normalizeText(_0x4540e1?.waveformLocalPath),
          waveformUrl: normalizeText(_0x4540e1?.waveformUrl)
        });
      }
    }
    const _0x49c43a = _0x426e5b({
      assetRefs: _0xfab51b,
      targetKind: "audio",
      notify: false,
      sourceAssets: _0xb86a7f
    });
    const _0x369e84 = _0x5cae27({
      ..._0x479b40,
      workspace: {
        ..._0x479b40.workspace,
        characterAssetTab: "audio",
        assetSelectionMode: false,
        selectedAssetIds: []
      }
    });
    showToast(_0x2153d6.length > 1 ? "已上传 " + _0x2153d6.length + " 个音频素材。" : "音频素材已上传。", "success");
    return {
      ..._0x49c43a,
      project: _0x369e84
    };
  }
  function _0x426e5b({
    assetRefs = [],
    targetKind = "character",
    notify = true,
    sourceAssets = null
  } = {}) {
    const _0x3965d0 = ["character", "scene", "audio"].includes(targetKind) ? targetKind : "character";
    const _0x28d601 = _0x3965d0 === "scene" ? "scenes" : _0x3965d0 === "audio" ? "audioAssets" : "characters";
    const _0x34aa65 = Array.isArray(_0x479b40[_0x28d601]) ? _0x479b40[_0x28d601] : [];
    const _0x4bbf07 = _0x3965d0 === "scene" ? "场景" : _0x3965d0 === "audio" ? "音频" : "人物";
    const _0x4a553f = new Set((Array.isArray(assetRefs) ? assetRefs : []).map(_0x3b84e4 => normalizeText(_0x3b84e4?.assetId || _0x3b84e4?.sourceAssetId) + ":" + Math.max(0, Math.trunc(Number(_0x3b84e4?.itemIndex ?? _0x3b84e4?.sourceItemIndex) || 0))));
    const _0x3ce2a4 = new Map(_0x34aa65.filter(_0x22d429 => normalizeText(_0x22d429?.sourceOrigin) === "library").map(_0x25ad47 => [normalizeText(_0x25ad47.sourceAssetId) + ":" + Math.max(0, Math.trunc(Number(_0x25ad47.sourceItemIndex) || 0)), _0x25ad47]));
    const _0x363048 = [];
    const _0x341c01 = [];
    const _0x4afb40 = new Set(_0x34aa65.map(_0x3b3125 => _0x3b3125.id));
    const _0x300a82 = Array.isArray(sourceAssets) ? sourceAssets : _0x358c04();
    _0x300a82.forEach(_0x45e8ff => {
      const _0x51b99b = normalizeText(_0x45e8ff?.assetId || _0x45e8ff?.sourceAssetId);
      const _0x565ccd = Math.max(0, Math.trunc(Number(_0x45e8ff?.itemIndex ?? _0x45e8ff?.sourceItemIndex) || 0));
      const _0xb0bf87 = _0x51b99b + ":" + _0x565ccd;
      if (!_0x4a553f.has(_0xb0bf87)) {
        return;
      }
      const _0x51b9e6 = _0x3ce2a4.get(_0xb0bf87);
      if (_0x51b9e6) {
        _0x341c01.push(_0x51b9e6.id);
        return;
      }
      const _0x20cfdd = normalizeText(_0x45e8ff?.type || _0x45e8ff?.mediaKind).toLowerCase();
      const _0x2fb6bf = _0x3965d0 === "audio" ? normalizeText(_0x45e8ff?.url || _0x45e8ff?.sourceUrl || _0x45e8ff?.audioUrl) : normalizeText(_0x45e8ff?.url || _0x45e8ff?.sourceUrl || _0x45e8ff?.imageUrl);
      const _0x560de4 = _0x3965d0 === "audio" ? "audio" : "image";
      if (_0x20cfdd !== _0x560de4 || !_0x2fb6bf) {
        return;
      }
      let _0x4f5a67 = _0x34aa65.length + _0x363048.length + 1;
      const _0xb7b3b9 = _0x3965d0 === "scene" ? "target-scene" : _0x3965d0 === "audio" ? "project-audio" : "target";
      while (_0x4afb40.has(_0xb7b3b9 + "-" + _0x4f5a67)) {
        _0x4f5a67 += 1;
      }
      const _0x18785e = _0xb7b3b9 + "-" + _0x4f5a67;
      const _0x22bce9 = createUploadedAssetName(_0x45e8ff.name || _0x45e8ff.assetName, "");
      const _0x3c0bdc = _0x3965d0 === "audio" ? createUploadedAssetName(getPersonReplacementAudioSavedName(_0x45e8ff), "") : "";
      _0x4afb40.add(_0x18785e);
      let _0x58acec;
      if (_0x3965d0 === "audio") {
        _0x58acec = {
          id: _0x18785e,
          kind: "audio",
          mediaKind: "audio",
          role: "音频素材",
          name: _0x3c0bdc || "音频 " + _0x4f5a67,
          savedName: _0x3c0bdc || "音频 " + _0x4f5a67,
          assetName: normalizeText(_0x45e8ff.assetName) || _0x22bce9 || "音频 " + _0x4f5a67,
          sourceOrigin: "library",
          sourceAssetId: _0x51b99b,
          sourceItemIndex: _0x565ccd,
          sourceUrl: _0x2fb6bf,
          audioUrl: _0x2fb6bf,
          waveformLocalPath: normalizeText(_0x45e8ff.waveformLocalPath),
          waveformUrl: normalizeText(_0x45e8ff.waveformUrl),
          durationSec: Math.max(0, Number(_0x45e8ff.durationSec) || 0),
          occurrences: "当前项目",
          description: "",
          isLibraryAsset: false
        };
      } else {
        const _0x52ceea = _0x18785e + "-appearance-1";
        _0x58acec = {
          id: _0x18785e,
          kind: _0x3965d0,
          role: _0x4bbf07,
          name: _0x22bce9 || "目标" + _0x4bbf07 + " " + _0x4f5a67,
          sourceOrigin: "library",
          sourceAssetId: _0x51b99b,
          sourceItemIndex: _0x565ccd,
          appearances: [{
            id: _0x52ceea,
            name: _0x3965d0 === "scene" ? "场景图" : "基础形象",
            imageUrl: _0x2fb6bf,
            prompt: "",
            occurrences: "总素材"
          }],
          baseAppearanceId: _0x52ceea,
          ...(_0x3965d0 === "character" ? {
            voiceReference: null
          } : {}),
          description: ""
        };
      }
      _0x363048.push(_0x58acec);
      _0x3ce2a4.set(_0xb0bf87, _0x58acec);
    });
    const _0x385390 = [..._0x341c01, ..._0x363048.map(_0x31fac5 => _0x31fac5.id)];
    if (!_0x385390.length) {
      if (notify) {
        showToast(_0x3965d0 === "audio" ? "请选择总素材中的音频后再加入项目。" : "请选择总素材中的图片后再加入" + _0x4bbf07 + "。", "warn");
      }
      return {
        project: _0x461c5c(),
        addedCount: 0,
        existingCount: 0
      };
    }
    _0x5cae27({
      ..._0x479b40,
      [_0x28d601]: [..._0x34aa65, ..._0x363048],
      workspace: {
        ..._0x479b40.workspace,
        ...(_0x3965d0 === "scene" ? {
          selectedSceneId: _0x385390.at(-1)
        } : _0x3965d0 === "audio" ? {
          selectedAudioAssetId: _0x385390.at(-1)
        } : {
          selectedCharacterId: _0x385390.at(-1)
        }),
        assetSelectionMode: false,
        selectedAssetIds: []
      }
    }, {
      sync: false
    });
    if (notify && _0x363048.length) {
      showToast("已将 " + _0x363048.length + " 项总素材加入" + _0x4bbf07 + "。", "success");
    } else if (notify) {
      showToast(_0x3965d0 === "audio" ? "所选音频已在当前项目中。" : "所选图片已在" + _0x4bbf07 + "素材中。", "info");
    }
    return {
      project: _0x461c5c(),
      addedCount: _0x363048.length,
      existingCount: _0x341c01.length
    };
  }
  function _0x3dd08f(_0x47c24d = {}) {
    return _0x426e5b({
      ..._0x47c24d,
      targetKind: "character"
    });
  }
  async function _0x517b93(_0x40b1b5, _0x278692 = {}) {
    if (!_0x40b1b5 || typeof _0xb16d1a !== "function") {
      return null;
    }
    const _0x2cc9c7 = await _0xb16d1a(_0x40b1b5, _0x479b40.id);
    const _0x3ba1df = resolveMediaRef(_0x2cc9c7);
    if (!_0x3ba1df) {
      throw new Error("人物形象保存结果缺少可用地址");
    }
    const _0x33407e = _0x479b40.characters.map(_0xdeed9a => _0xdeed9a.id === _0x278692.characterId ? {
      ..._0xdeed9a,
      appearances: _0xdeed9a.appearances.map(_0x3f6933 => _0x3f6933.id === _0x278692.appearanceId ? {
        ..._0x3f6933,
        imageUrl: _0x3ba1df,
        generationStatus: "succeeded",
        error: ""
      } : _0x3f6933)
    } : _0xdeed9a);
    return {
      project: _0x5cae27({
        ..._0x479b40,
        characters: _0x33407e
      })
    };
  }
  async function _0x2a10b4(_0x398624, _0x58e367 = {}) {
    if (!_0x398624 || typeof _0xb16d1a !== "function") {
      return null;
    }
    const _0x535586 = normalizeText(_0x58e367.shotId);
    const _0x372b83 = _0x479b40.shots.find(_0x209180 => _0x209180.id === _0x535586);
    if (!_0x372b83) {
      throw new Error("当前片段不可用");
    }
    const _0x3df243 = _0x479b40.id;
    const _0x275217 = createPersonReplacementImageGenerationMappingRevision({
      project: _0x479b40,
      shot: _0x372b83
    });
    const _0x6769e2 = await _0xb16d1a(_0x398624, _0x3df243);
    const _0xd98d1 = resolveMediaRef(_0x6769e2);
    if (!_0xd98d1) {
      throw new Error("替换图片保存结果缺少可用地址");
    }
    const _0x474e22 = _0x5495da.acceptUploadedResult({
      shotId: _0x535586,
      imageRef: _0xd98d1,
      fileName: normalizeText(_0x398624.name),
      createdAt: nowIso(),
      expectedProjectId: _0x3df243,
      expectedShotRevision: _0x275217
    });
    if (!_0x474e22) {
      return null;
    }
    showToast("替换图片已加入当前片段。", "success");
    return {
      project: _0x474e22
    };
  }
  function _0x376f09({
    shotId = "",
    slotId = "",
    input = null
  } = {}) {
    const _0x4eb699 = normalizeText(shotId);
    const _0x281d1c = normalizeText(slotId);
    const _0x9dbf14 = _0x479b40.shots.find(_0x5458f4 => _0x5458f4.id === _0x4eb699);
    if (!_0x9dbf14 || !_0x281d1c) {
      return null;
    }
    const _0xe392ef = {
      ...(_0x9dbf14.replacementVideoInputsBySlot || {})
    };
    if (input) {
      _0xe392ef[_0x281d1c] = input;
    } else {
      delete _0xe392ef[_0x281d1c];
    }
    const _0x243299 = {
      ..._0x479b40,
      shots: _0x479b40.shots.map(_0x5a805e => _0x5a805e.id === _0x4eb699 ? {
        ..._0x5a805e,
        replacementVideoInputsBySlot: _0xe392ef,
        error: ""
      } : _0x5a805e),
      workspace: {
        ...updatePersonReplacementVideoGenerationState(_0x479b40.workspace, {
          status: "idle",
          shotId: _0x4eb699,
          error: ""
        }),
        selectedShotId: _0x4eb699
      }
    };
    return _0x5cae27(_0x243299, {
      renderWorkspace: false
    });
  }
  async function _0x346f48(_0x4b4c72, _0x1e8fc3 = {}) {
    if (!_0x4b4c72 || typeof _0xb16d1a !== "function") {
      return null;
    }
    try {
      const _0x5123c4 = normalizeText(_0x1e8fc3.shotId);
      const _0x472b12 = normalizeText(_0x1e8fc3.slotId);
      const _0x3a6381 = _0x479b40.shots.find(_0x146778 => _0x146778.id === _0x5123c4);
      if (!_0x3a6381) {
        throw new Error("当前片段不可用");
      }
      const _0xeaa649 = resolvePersonReplacementVideoSlotState(_0x479b40, _0x3a6381);
      if (normalizeText(_0x1e8fc3.modelId) && normalizeText(_0x1e8fc3.modelId) !== _0xeaa649.modelId) {
        throw new Error("视频模型已经切换，请重新选择入参槽");
      }
      if (_0xeaa649.readOnlySlots.includes(_0x472b12)) {
        throw new Error("源视频和当前参考图由所选片段自动提供");
      }
      const _0x21a8d8 = normalizeText(_0xeaa649.fixedInputConfig?.slotKindById?.[_0x472b12]);
      if (!_0x21a8d8) {
        throw new Error("当前模型没有这个入参槽");
      }
      const _0x1d088f = normalizeText(_0x4b4c72.type).toLowerCase();
      const _0x5b23a9 = normalizeText(_0x4b4c72.name).toLowerCase();
      const _0x2d4b8c = _0x1d088f.startsWith("image/") || /\.(?:avif|bmp|gif|jpe?g|png|webp)$/i.test(_0x5b23a9) ? "image" : _0x1d088f.startsWith("video/") || /\.(?:avi|m4v|mkv|mov|mp4|webm)$/i.test(_0x5b23a9) ? "video" : "";
      if (_0x2d4b8c !== _0x21a8d8) {
        throw new Error(_0x21a8d8 === "video" ? "请选择视频文件" : "请选择图片文件");
      }
      const _0x1df8f7 = await _0xb16d1a(_0x4b4c72, _0x479b40.id);
      const _0xc56fda = resolveMediaRef(_0x1df8f7);
      if (!_0xc56fda) {
        throw new Error("视频模型入参保存结果缺少可用地址");
      }
      const _0x54f14e = _0x376f09({
        shotId: _0x5123c4,
        slotId: _0x472b12,
        input: {
          kind: _0x21a8d8,
          url: _0xc56fda,
          modelId: _0xeaa649.modelId,
          fileName: normalizeText(_0x4b4c72.name),
          mimeType: normalizeText(_0x4b4c72.type),
          thumbUrl: resolveVideoThumbnailRef(_0x1df8f7)
        }
      });
      showToast((_0xeaa649.fixedInputConfig?.slotById?.[_0x472b12]?.label || "模型入参") + "已接入。", "success");
      if (_0x54f14e) {
        return {
          project: _0x54f14e
        };
      } else {
        return null;
      }
    } catch (_0x27e696) {
      showToast(_0x27e696?.message || "视频模型入参上传失败", "error");
      return null;
    }
  }
  function _0x2adba8(_0x5cae81 = {}) {
    const _0x3bfe1b = normalizeText(_0x5cae81.shotId);
    const _0xd33a7e = normalizeText(_0x5cae81.slotId);
    const _0x2cdd9e = _0x479b40.shots.find(_0x10c4a5 => _0x10c4a5.id === _0x3bfe1b);
    if (!_0x2cdd9e || !_0x2cdd9e.replacementVideoInputsBySlot?.[_0xd33a7e]) {
      return null;
    }
    const _0x1920fc = _0x376f09({
      shotId: _0x3bfe1b,
      slotId: _0xd33a7e,
      input: null
    });
    if (_0x1920fc) {
      return {
        project: _0x1920fc
      };
    } else {
      return null;
    }
  }
  async function _0x12616a(_0x359d84, _0x39c0e3 = {}) {
    if (!_0x359d84 || typeof _0xb16d1a !== "function") {
      return null;
    }
    const _0x43d61d = await _0xb16d1a(_0x359d84, _0x479b40.id);
    const _0x2b57a9 = resolveMediaRef(_0x43d61d);
    if (!_0x2b57a9) {
      throw new Error("关键帧保存结果缺少可用地址");
    }
    return {
      keyframeRef: _0x2b57a9,
      keyframeTimeSec: Number(_0x39c0e3.keyframeTimeSec) || 0,
      frame: _0x39c0e3.frame && typeof _0x39c0e3.frame === "object" ? {
        ..._0x39c0e3.frame
      } : {}
    };
  }
  async function _0x11fa77(_0x5c7fbc, _0x382412 = {}) {
    if (!_0x5c7fbc || typeof _0xb16d1a !== "function") {
      return null;
    }
    const _0xbcb8ea = await _0xb16d1a(_0x5c7fbc, _0x479b40.id);
    const _0x1bc416 = resolveMediaRef(_0xbcb8ea);
    if (!_0x1bc416) {
      throw new Error("声音保存结果缺少可用地址");
    }
    const _0x4be8f8 = _0x479b40.characters.map(_0x3f6e9f => _0x3f6e9f.id === _0x382412.characterId ? {
      ..._0x3f6e9f,
      voiceRef: _0x1bc416,
      voiceReference: {
        audioUrl: resolveMediaUrl(_0x1bc416),
        localPath: normalizeLocalPath(_0x1bc416) || _0x1bc416,
        fileName: normalizeText(_0x5c7fbc.name) || "上传声音",
        source: "upload",
        updatedAt: Date.now()
      }
    } : _0x3f6e9f);
    return {
      project: _0x5cae27({
        ..._0x479b40,
        characters: _0x4be8f8
      })
    };
  }
  function _0x127255(_0x11fe53 = {}) {
    const _0x1c63d3 = normalizeText(_0x11fe53.characterId);
    const _0x471d43 = _0x11fe53.asset && typeof _0x11fe53.asset === "object" ? _0x11fe53.asset : {};
    const _0x1af191 = _0x479b40.characters.find(_0x26a2d2 => _0x26a2d2.id === _0x1c63d3);
    if (!_0x1af191) {
      showToast("要添加声音的人设不存在。", "warn");
      return null;
    }
    if (normalizeText(_0x471d43.mediaKind || _0x471d43.type).toLowerCase() !== "audio") {
      showToast("请选择音频素材。", "warn");
      return null;
    }
    const _0x5cfa5e = getPersonReplacementLibraryAudioRef(_0x471d43);
    if (!_0x5cfa5e) {
      showToast("所选音频缺少可用地址。", "warn");
      return null;
    }
    const _0x3f1b7e = normalizeLocalPath(_0x5cfa5e);
    const _0x1b3eca = buildPersonReplacementLibraryVoiceReference(_0x471d43, {
      audioUrl: resolveMediaUrl(_0x5cfa5e),
      localPath: _0x3f1b7e
    });
    const _0x5d52c3 = _0x479b40.characters.map(_0x370cbc => _0x370cbc.id === _0x1c63d3 ? {
      ..._0x370cbc,
      voiceRef: _0x3f1b7e || _0x5cfa5e,
      voiceReference: _0x1b3eca
    } : _0x370cbc);
    const _0x1d998a = _0x5cae27({
      ..._0x479b40,
      characters: _0x5d52c3
    });
    showToast("已为「" + _0x1af191.name + "」添加声音。", "success");
    return {
      project: _0x1d998a
    };
  }
  async function _0x4d4162(_0x52da19 = {}) {
    const _0xe73984 = _0x479b40.characters.find(_0x38977c => _0x38977c.id === _0x52da19.characterId);
    if (!_0xe73984) {
      return null;
    }
    const _0x235cff = normalizeText(_0x52da19.prompt || _0xe73984.description);
    const _0x43971f = normalizeText(_0x52da19.promptPresetId) || normalizeText(_0x479b40.workspace.assetPromptPresetId);
    const _0x3b6ce5 = applyPersonReplacementCharacterAssetPromptPreset(_0x43971f, _0x235cff);
    const _0x20607b = getPersonReplacementCharacterBaseImageRef(_0xe73984);
    if (!_0x20607b) {
      showToast("请先上传人物基础形象。", "warn");
      return null;
    }
    if (!_0x3b6ce5) {
      showToast("请先填写新形象提示词。", "warn");
      return null;
    }
    if (typeof _0x3f6aff !== "function") {
      showToast("图像生成服务尚未初始化。", "error");
      return null;
    }
    const _0x17feab = _0x479b40.id + ":" + _0xe73984.id;
    if (_0x510be3.has(_0x17feab)) {
      return null;
    }
    _0x510be3.add(_0x17feab);
    const _0x4a1298 = _0xe73984.appearances.length + 1;
    const _0x559bb5 = _0xe73984.id + "-appearance-" + _0x4a1298 + "-" + Date.now();
    const _0x2b079e = {
      id: _0x559bb5,
      name: a1098_0x475bca(_0x43971f, _0x4a1298),
      imageUrl: "",
      prompt: _0x235cff,
      promptPresetId: _0x43971f,
      occurrences: "当前项目",
      generationStatus: "running",
      error: ""
    };
    _0x5cae27({
      ..._0x479b40,
      characters: _0x479b40.characters.map(_0x2b46fb => _0x2b46fb.id === _0xe73984.id ? {
        ..._0x2b46fb,
        appearances: [..._0x2b46fb.appearances, _0x2b079e]
      } : _0x2b46fb),
      workspace: {
        ..._0x479b40.workspace,
        assetAppearanceIndexes: {
          ..._0x479b40.workspace.assetAppearanceIndexes,
          [_0xe73984.id]: _0x4a1298 - 1
        },
        generatingAppearanceKeys: [..._0x479b40.workspace.generatingAppearanceKeys, _0xe73984.id + ":" + _0x559bb5]
      }
    });
    try {
      const _0x4fc966 = buildCharacterAssetImageGenerationPayload({
        prompt: _0x3b6ce5,
        modelId: _0x52da19.modelId || _0x479b40.settings.characterImageModelId,
        provider: _0x52da19.provider || _0x479b40.settings.characterImageProvider,
        providerProfileId: _0x52da19.providerProfileId || _0x479b40.settings.characterImageProviderProfileId,
        generationParams: _0x52da19.generationParams || _0x479b40.settings.characterImageGenerationParams,
        referenceImageUrls: [_0x20607b]
      });
      const _0x2eb35a = getFirstSuccessfulImageRef(await _0x3f6aff(_0x4fc966));
      const _0x32248e = _0x479b40.characters.map(_0x1119ca => _0x1119ca.id === _0xe73984.id ? {
        ..._0x1119ca,
        appearances: _0x1119ca.appearances.map(_0x14e9f2 => _0x14e9f2.id === _0x559bb5 ? {
          ..._0x14e9f2,
          imageUrl: _0x2eb35a,
          generationStatus: "succeeded",
          error: ""
        } : _0x14e9f2)
      } : _0x1119ca);
      const _0x6b3404 = _0x5cae27({
        ..._0x479b40,
        characters: _0x32248e,
        workspace: {
          ..._0x479b40.workspace,
          generatingAppearanceKeys: _0x479b40.workspace.generatingAppearanceKeys.filter(_0x7f04f6 => _0x7f04f6 !== _0xe73984.id + ":" + _0x559bb5)
        }
      });
      showToast("已新增" + _0x2b079e.name + "。", "success");
      if (_0x52da19.notifyCompletion !== false) {
        _0x341c67({
          kind: "asset",
          mediaRef: _0x2eb35a
        });
      }
      return {
        project: _0x6b3404,
        ok: true,
        characterId: _0xe73984.id
      };
    } catch (_0x58570c) {
      const _0x1c0a4f = _0x58570c?.getUserMessage?.() || _0x58570c?.message || "人物形象生成失败";
      const _0x52eb82 = _0x479b40.characters.map(_0x7547ce => _0x7547ce.id === _0xe73984.id ? {
        ..._0x7547ce,
        appearances: _0x7547ce.appearances.map(_0x45f209 => _0x45f209.id === _0x559bb5 ? {
          ..._0x45f209,
          generationStatus: "failed",
          error: _0x1c0a4f
        } : _0x45f209)
      } : _0x7547ce);
      const _0x56875a = _0x5cae27({
        ..._0x479b40,
        characters: _0x52eb82,
        workspace: {
          ..._0x479b40.workspace,
          generatingAppearanceKeys: _0x479b40.workspace.generatingAppearanceKeys.filter(_0x3df08a => _0x3df08a !== _0xe73984.id + ":" + _0x559bb5)
        }
      });
      showToast(_0x1c0a4f, "error");
      return {
        project: _0x56875a,
        ok: false,
        characterId: _0xe73984.id,
        error: _0x1c0a4f
      };
    } finally {
      _0x510be3.delete(_0x17feab);
    }
  }
  const _0x23762a = (_0x3ec6aa = {}) => _0x5495da.generate(_0x3ec6aa);
  const _0xc49552 = (_0xd31c48 = {}) => _0x5495da.cancel(_0xd31c48);
  const _0x49ca06 = createPersonReplacementVideoPreparationRunner({
    getProject: () => _0x479b40,
    getProjectById: _0x496d57,
    setProject: _0x5cae27,
    setProjectById: _0x1f72d0,
    isDestroyed: () => _0x358ed5,
    waitForActiveReverse: _0x110b75 => _0x50bb60.waitForActiveReverse(_0x110b75),
    fetchVideoMeta: fetchVideoMeta,
    resolveDurationSec: resolveDurationSec,
    enqueueMediaTask: enqueueMediaTask,
    resolveMediaRef: resolveMediaRef,
    showToast: showToast
  });
  _0x2b11ea = createPersonReplacementVideoTaskRuntime({
    getProject: () => _0x479b40,
    getProjectById: _0x496d57,
    setProject: _0x5cae27,
    setProjectById: _0x1f72d0,
    runPreparation: _0x49ca06,
    generateReplacementVideo: _0xe530be,
    resolveInstallId: _0x45c478,
    persistNow: _0x45e8e9,
    showToast: showToast,
    notifyGenerationCompleted: _0x341c67,
    now: nowIso,
    createId: () => createId("replacement-video-request")
  });
  function _0x5f123f(_0x276f09 = {}) {
    return _0x2b11ea.prepare(_0x276f09);
  }
  function _0x4360a3(_0x283f58 = {}) {
    return _0x2b11ea.generate(_0x283f58);
  }
  function _0x148c0c(_0x5752f1 = {}) {
    return _0x2b11ea.cancel(_0x5752f1);
  }
  _0x44d82e = createPersonReplacementVoiceSeparationRuntime({
    getProject: () => _0x479b40,
    setProject: _0x5cae27,
    persistNow: _0x45e8e9,
    showToast: showToast,
    now: nowIso,
    createId: () => createId("replacement-voice-separation"),
    onStateChange: ({
      sourceId: _0x5c0d17,
      state: _0x4c9960
    }) => {
      _0x37df20?.refreshVoiceSources?.({
        sourceId: _0x5c0d17,
        remountVoiceStudio: _0x4c9960?.status === "succeeded"
      });
    }
  });
  const _0x199f0c = createPersonReplacementOutputCoordinator({
    documentObject: documentObject,
    windowObject: windowObject,
    projectSession: _0x28b128,
    getWorkspace: () => _0x37df20,
    prepareVideoReplacementShots: _0x5f123f,
    createVoicePanel: createVoicePanel,
    enqueueMediaTask: enqueueMediaTask,
    playCompletion: playCompletion,
    showCompletionNotification: showCompletionNotification,
    saveMedia: saveMedia,
    saveMediaFiles: saveMediaFiles,
    createOutputCanvas: createOutputCanvas,
    onRequestClose: onRequestClose,
    showToast: showToast
  });
  _0x37df20 = createWorkspace({
    documentObject: documentObject,
    windowObject: windowObject,
    mountTarget: mountTarget,
    initialProject: _0x461c5c(),
    projectSession: _0x28b128,
    getLibraryAssets: _0x358c04,
    onSourceVideosSelected: _0x365474,
    onSourceVideoSelected: _0x4de9f3 => _0x365474([_0x4de9f3]),
    onRemoveSourceRequested: _0x2f70d4,
    onProcessRequested: _0x168bc2,
    onAddLibraryAssetsToProjectRequested: _0x426e5b,
    onAddLibraryAssetsToCharactersRequested: _0x3dd08f,
    onAddAssetAppearanceToLibraryRequested: _0x436c50,
    onNewCharacterImagesSelected: _0x3c35b4,
    onNewCharacterImageSelected: _0x14e947 => _0x3c35b4([_0x14e947]),
    onNewSceneImagesSelected: _0x44a8e8,
    onNewAudioFilesSelected: _0xa33c34,
    onCharacterReferenceSelected: _0x517b93,
    onReplacementImageSelected: _0x2a10b4,
    onReplacementVideoInputSelected: _0x346f48,
    onReplacementVideoInputRemoved: _0x2adba8,
    onShotKeyframeSelected: _0x12616a,
    onCharacterVoiceSelected: _0x11fa77,
    onCharacterVoiceLibrarySelected: _0x127255,
    onDeleteCharacterRequested: _0x331b47,
    onDeleteSceneRequested: _0x365c59,
    onDeleteAudioAssetRequested: _0x763005,
    onDownloadImageRequested: _0x199f0c.downloadImage,
    onGenerateCharacterImageRequested: _0x4d4162,
    onGenerateReplacementImageRequested: _0x23762a,
    onCancelReplacementImageRequested: _0xc49552,
    onGenerateReplacementVideoRequested: _0x4360a3,
    onCancelReplacementVideoRequested: _0x148c0c,
    onGenerationBatchCompleted: _0x4d6117,
    onShotCutDetectionRequested: _0x2d39b7,
    onShotCutRangesRequested: _0x3152c5,
    onShotReverseRequested: _0xd21de3,
    onManualPersonSelected: _0x57eb8e,
    onUpdatePeopleRequested: _0x3b4b3c,
    onDeletePeopleRequested: _0x339787,
    onMergeSourceIdentitiesRequested: _0x4c8915,
    onSplitSourceIdentityRequested: _0x531fdf,
    onConfirmSourceIdentityRequested: _0x2819af,
    onVoiceStudioMount: _0x199f0c.mountVoiceStudio,
    onVoiceSeparationRequested: _0x44d82e.extract,
    onVoiceSeparationCancelRequested: _0x44d82e.cancel,
    onVoiceSeparationResumeRequested: _0x44d82e.resume,
    onOpenProjectRequested: _0x38a874,
    onRenameProjectRequested: _0x22f093,
    onDuplicateProjectRequested: _0x343981,
    onArchiveProjectRequested: _0x23e654,
    onDeleteProjectRequested: _0x18583c,
    onBackHomeRequested: _0x349079,
    onComposeRequested: _0x199f0c.composeOutput,
    onExportRequested: _0x199f0c.exportOutput,
    onAddToCanvasRequested: _0x199f0c.addOutputToCanvas,
    onStepNavigationBlocked: ({
      reason: _0x4163d7
    } = {}) => {
      const _0x5824ec = _0x4163d7 === PERSON_REPLACEMENT_STEP_GATE_REASONS.ASSET_SETTINGS_INCOMPLETE ? "请先在素材设定上传至少一张人物或场景图片。" : _0x4163d7 === PERSON_REPLACEMENT_STEP_GATE_REASONS.IMAGE_REPLACEMENT_INCOMPLETE ? "请先在图像替换中绑定人物或场景。" : "正在处理片段";
      showToast(_0x5824ec, "info");
    },
    onClose: () => onRequestClose()
  });
  if (typeof subscribeLibraryAssets === "function") {
    try {
      const _0x3d644a = subscribeLibraryAssets(() => {
        if (!_0x358ed5) {
          _0x190aa6();
        }
      });
      if (typeof _0x3d644a === "function") {
        _0x52ad81 = _0x3d644a;
      }
    } catch (_0x93c683) {
      console.warn("[replacementStudio] failed to subscribe asset library", _0x93c683);
    }
  }
  const _0x53022f = _0x479b40;
  const _0x2ed757 = _0x51132b;
  let _0x1829af = false;
  const _0x8486ed = Promise.resolve().then(async () => {
    if (typeof _0x1f18f9 !== "function") {
      _0x1829af = true;
      return;
    }
    const _0xb2063f = normalizePersonReplacementProjectLibrary(await _0x1f18f9());
    const _0x3521ef = _0xb2063f.projects.filter(isPersistable);
    _0x49358c = _0x3521ef.length !== _0xb2063f.projects.length;
    const _0x80a679 = _0x3521ef.map(_0x5348f9 => {
      const _0x493ce2 = settleInterruptedReplacementStudioProjectTasks(_0x5348f9);
      if (_0x493ce2.changed) {
        _0x49358c = true;
      }
      return _0x493ce2.project;
    });
    const _0x4a6edb = await Promise.all(_0x80a679.map(_0x4fa00d => hydratePersonReplacementSourcePlaybackRefs(_0x4fa00d, {
      checkMediaExists: checkMediaExists
    })));
    if (_0x4a6edb.some(_0x4b40ac => _0x4b40ac.changed)) {
      _0x49358c = true;
    }
    _0x287023 = normalizePersonReplacementProjectLibrary({
      ..._0xb2063f,
      projects: _0x4a6edb.map(_0x1678bc => _0x1678bc.project)
    });
    const _0x432b2b = _0x479b40 !== _0x53022f || _0x51132b !== _0x2ed757;
    if (_0x432b2b) {
      if (isPersistable(_0x479b40)) {
        _0x287023 = upsertPersonReplacementProject(_0x287023, _0x479b40);
        _0x49358c = true;
      }
    } else {
      _0x28b128.replace(createInitialProject(), {
        persist: false,
        presentation: "none",
        reason: "hydrate-home",
        touchUpdatedAt: false
      });
      _0x51132b = "home";
    }
    _0x190aa6();
    _0x1829af = true;
  }).catch(_0x37836f => {
    console.warn("[replacementStudio] hydration failed", _0x37836f);
    _0x124bd5.setHydrationError(_0x37836f);
    showToast("人物替换项目加载失败，已暂停自动保存以防覆盖数据。", "error");
  }).finally(() => {
    if (!_0x1829af) {
      return;
    }
    _0x124bd5.setReady(true);
    if (_0x49358c) {
      _0x18fe20();
    }
  });
  return Object.freeze({
    open() {
      _0x37df20.open({
        project: _0x461c5c()
      });
      return _0x37df20;
    },
    close() {
      return _0x37df20.close();
    },
    getProject() {
      return cloneJson(_0x479b40);
    },
    isSourceProcessing() {
      return Boolean(_0x1ccd62);
    },
    getProjects() {
      return cloneJson(_0x287023.projects);
    },
    setProject: _0x5cae27,
    openProject: _0x38a874,
    renameProject: _0x22f093,
    duplicateProject: _0x343981,
    archiveProject: _0x23e654,
    deleteProject: _0x18583c,
    showProjectHome: _0x349079,
    loadSourceFile(_0x3d3e21) {
      return _0x365474([_0x3d3e21]);
    },
    loadSourceFiles: _0x365474,
    removeSource: _0x2f70d4,
    uploadReplacementImage: _0x2a10b4,
    saveShotKeyframe: _0x12616a,
    startSourceProcessing(_0x30f0de = {}) {
      return _0x168bc2(_0x30f0de);
    },
    updateShotCutRanges: _0x3152c5,
    updateShotReverse: _0xd21de3,
    detectShotCutRanges: _0x2d39b7,
    prepareVideoReplacementShots: _0x5f123f,
    async analyzeSourceFile(_0x2d50d9) {
      const _0x196c72 = await _0x365474([_0x2d50d9]);
      if (_0x196c72?.ok) {
        return await _0x168bc2({
          mode: "cut"
        });
      } else {
        return _0x196c72;
      }
    },
    whenReady() {
      return _0x8486ed;
    },
    async persist() {
      await _0x8486ed;
      return await _0x45e8e9({
        force: !_0x124bd5.isDirty()
      });
    },
    destroy() {
      if (_0x358ed5) {
        return;
      }
      _0x50bb60.invalidate();
      _0x1ccd62?.abort?.();
      _0x1ccd62 = null;
      _0x5495da?.destroy?.();
      _0x2b11ea?.destroy?.();
      _0x44d82e?.destroy?.();
      _0x1a32b6();
      _0x52ad81();
      _0x52ad81 = () => {};
      _0x124bd5.destroy({
        flush: true,
        force: true
      }).catch(() => {});
      _0x358ed5 = true;
      _0x37df20.destroy();
      _0x199f0c.destroy();
      _0x380d41();
      _0x28b128.destroy();
    }
  });
}