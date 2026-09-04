import { executeStoryboard3DAICommandPlan, generateStoryboard3DAICommandPlan, validateStoryboard3DAICommandPlan } from "./aiCommandAgent.js";
import { createStoryboard3DAssetLibrary } from "./assetLibrary.js";
import { STORYBOARD_3D_ACTIONS, STORYBOARD_3D_HAND_POSES } from "./characterRig.js";
import { cloneStoryboard3DProject, createDefaultStoryboard3DTransform, createStoryboard3DScene, createStoryboard3DShot, migrateStoryboard3DProject } from "./projectModel.js";
import { upsertStoryboard3DCameraKeyframe } from "./shotAnimation.js";
import { createStoryboard3DVoiceInputService } from "./voiceInputService.js";
const ACTION_IDS = new Set(STORYBOARD_3D_ACTIONS.map(_0x49be3d => _0x49be3d.id));
const HAND_POSE_IDS = new Set(STORYBOARD_3D_HAND_POSES.map(_0x3e53c1 => _0x3e53c1.id));
function normalizedText(_0x6651b9) {
  return String(_0x6651b9 || "").trim();
}
function createId(_0x2f5d25, _0xca16f2) {
  const _0x85f08d = typeof _0xca16f2 === "function" ? _0xca16f2(_0x2f5d25) : globalThis.crypto?.randomUUID?.();
  return normalizedText(_0x85f08d) || _0x2f5d25 + "_" + Date.now() + "_" + Math.random().toString(36).slice(2, 10);
}
function requireScene(_0x4965cc, _0x490cce) {
  const _0x3fad20 = _0x4965cc.scenes.find(_0x3bd127 => _0x3bd127.id === _0x490cce);
  if (!_0x3fad20) {
    throw new Error("Scene does not exist: " + _0x490cce);
  }
  return _0x3fad20;
}
function requireObject(_0x3605ca, _0x28700d) {
  const _0xdf5ef6 = _0x3605ca.objects.find(_0x27b576 => _0x27b576.id === _0x28700d);
  if (!_0xdf5ef6) {
    throw new Error("Object does not exist: " + _0x28700d);
  }
  return _0xdf5ef6;
}
function requireShot(_0x6b03f1, _0xb6ba63) {
  const _0x4ed3a0 = _0x6b03f1.shots.find(_0x55a1a9 => _0x55a1a9.id === _0xb6ba63);
  if (!_0x4ed3a0) {
    throw new Error("Shot does not exist: " + _0xb6ba63);
  }
  return _0x4ed3a0;
}
function activeShot(_0x2426a) {
  return _0x2426a.shots.find(_0x3c96ab => _0x3c96ab.id === _0x2426a.activeShotId) || _0x2426a.shots[0] || null;
}
function mergeTransform(_0x3519c5, _0xd7512e) {
  return {
    position: _0xd7512e.position ? [..._0xd7512e.position] : [..._0x3519c5.position],
    rotation: _0xd7512e.rotation ? [..._0xd7512e.rotation] : [..._0x3519c5.rotation],
    scale: _0xd7512e.scale ? [..._0xd7512e.scale] : [..._0x3519c5.scale]
  };
}
function resolveCamera(_0x1d9e94, _0x3ffb46) {
  const _0x44df3f = _0x3ffb46?.(_0x1d9e94.id);
  if (_0x44df3f) {
    return cloneStoryboard3DProject(_0x44df3f);
  }
  return cloneStoryboard3DProject(activeShot(_0x1d9e94)?.camera || {});
}
function sceneLayout(_0x1e4f5b) {
  const _0x6c703c = _0x1e4f5b.objects.filter(_0x47e1c0 => _0x47e1c0.type !== "camera");
  return {
    sceneId: _0x1e4f5b.id,
    name: _0x1e4f5b.name,
    objectCount: _0x6c703c.length,
    objects: _0x6c703c.map(_0x4d293c => ({
      objectId: _0x4d293c.id,
      type: _0x4d293c.type,
      name: _0x4d293c.name,
      visible: _0x4d293c.visible,
      locked: _0x4d293c.locked,
      transform: cloneStoryboard3DProject(_0x4d293c.transform)
    }))
  };
}
function executeSafeTool(_0x29260e, _0x195b6a, _0x195b6f) {
  const {
    args: _0x3ebc77,
    sceneId: _0x45ffc1,
    tool: _0x2618c2
  } = _0x195b6a;
  if (_0x2618c2 === "createScene") {
    const _0x5b6e8b = createStoryboard3DScene({
      name: _0x3ebc77.name,
      now: _0x195b6f.now,
      idFactory: _0x195b6f.idFactory
    });
    _0x29260e.scenes.push(_0x5b6e8b);
    _0x29260e.activeSceneId = _0x5b6e8b.id;
    return {
      changed: true,
      result: {
        sceneId: _0x5b6e8b.id
      }
    };
  }
  const _0x4f978a = requireScene(_0x29260e, _0x45ffc1);
  if (_0x2618c2 === "getSceneLayout") {
    return {
      changed: false,
      result: sceneLayout(_0x4f978a)
    };
  }
  if (_0x2618c2 === "listShots") {
    return {
      changed: false,
      result: _0x4f978a.shots.map(_0x4dec92 => ({
        shotId: _0x4dec92.id,
        name: _0x4dec92.name,
        description: _0x4dec92.description,
        camera: cloneStoryboard3DProject(_0x4dec92.camera)
      }))
    };
  }
  if (_0x2618c2 === "checkComposition") {
    const _0xcf5f7f = activeShot(_0x4f978a);
    return {
      changed: false,
      result: {
        sceneId: _0x4f978a.id,
        shotId: _0xcf5f7f?.id || null,
        objectCount: _0x4f978a.objects.filter(_0x1edda4 => _0x1edda4.visible !== false && _0x1edda4.type !== "camera").length,
        camera: _0xcf5f7f ? cloneStoryboard3DProject(_0xcf5f7f.camera) : null
      }
    };
  }
  if (_0x2618c2 === "addProp") {
    const _0x27a4bd = _0x195b6f.assetLibrary.find(_0x3ebc77.assetId);
    if (!_0x27a4bd) {
      throw new Error("Asset does not exist: " + _0x3ebc77.assetId);
    }
    if (!["builtin", "pack"].includes(_0x27a4bd.source?.kind)) {
      throw new Error("Asset is not available to the 3D Agent: " + _0x3ebc77.assetId);
    }
    const _0x476c5a = {
      id: createId("prop", _0x195b6f.idFactory),
      type: "prop",
      name: _0x3ebc77.name || _0x27a4bd.name,
      assetId: _0x27a4bd.source?.assetId || _0x27a4bd.id,
      visible: true,
      locked: false,
      transform: mergeTransform(createDefaultStoryboard3DTransform(), _0x3ebc77),
      castShadow: true,
      receiveShadow: true
    };
    _0x4f978a.objects.push(_0x476c5a);
    _0x195b6f.usedAssetIds.add(_0x3ebc77.assetId);
    return {
      changed: true,
      result: {
        objectId: _0x476c5a.id
      }
    };
  }
  if (_0x2618c2 === "addCharacter") {
    if (_0x3ebc77.actionId && !ACTION_IDS.has(_0x3ebc77.actionId)) {
      throw new Error("Character action does not exist: " + _0x3ebc77.actionId);
    }
    const _0x178d9b = {
      id: createId("character", _0x195b6f.idFactory),
      type: "character",
      name: _0x3ebc77.name || "Character",
      bodyPresetId: _0x3ebc77.bodyPreset || _0x3ebc77.assetId,
      ...(_0x3ebc77.actionId ? {
        actionId: _0x3ebc77.actionId
      } : {}),
      visible: true,
      locked: false,
      transform: mergeTransform(createDefaultStoryboard3DTransform(), _0x3ebc77)
    };
    _0x4f978a.objects.push(_0x178d9b);
    return {
      changed: true,
      result: {
        objectId: _0x178d9b.id
      }
    };
  }
  if (_0x2618c2 === "addLight") {
    const _0x5f0476 = {
      id: createId("light", _0x195b6f.idFactory),
      type: "light",
      name: _0x3ebc77.lightType + " light",
      lightType: _0x3ebc77.lightType,
      color: _0x3ebc77.color || "#ffffff",
      intensity: _0x3ebc77.intensity,
      visible: true,
      locked: false,
      transform: {
        ...createDefaultStoryboard3DTransform(),
        position: [..._0x3ebc77.position]
      },
      castShadow: _0x3ebc77.lightType !== "ambient"
    };
    _0x4f978a.objects.push(_0x5f0476);
    return {
      changed: true,
      result: {
        objectId: _0x5f0476.id
      }
    };
  }
  if (_0x2618c2 === "deleteObject") {
    const _0x285d17 = requireObject(_0x4f978a, _0x3ebc77.objectId);
    if (_0x285d17.locked) {
      throw new Error("Object is locked: " + _0x285d17.id);
    }
    _0x4f978a.objects = _0x4f978a.objects.filter(_0x9fd3ea => _0x9fd3ea.id !== _0x285d17.id);
    return {
      changed: true,
      result: {
        objectId: _0x285d17.id
      }
    };
  }
  if (_0x2618c2 === "updateObject") {
    const _0x40844c = requireObject(_0x4f978a, _0x3ebc77.objectId);
    if (_0x40844c.locked && _0x3ebc77.locked !== false) {
      throw new Error("Object is locked: " + _0x40844c.id);
    }
    if (_0x3ebc77.name) {
      _0x40844c.name = _0x3ebc77.name;
    }
    if (typeof _0x3ebc77.visible === "boolean") {
      _0x40844c.visible = _0x3ebc77.visible;
    }
    if (typeof _0x3ebc77.locked === "boolean") {
      _0x40844c.locked = _0x3ebc77.locked;
    }
    _0x40844c.transform = mergeTransform(_0x40844c.transform, _0x3ebc77);
    return {
      changed: true,
      result: {
        objectId: _0x40844c.id
      }
    };
  }
  if (_0x2618c2 === "setCharacterAction") {
    const _0x4e1093 = requireObject(_0x4f978a, _0x3ebc77.objectId);
    if (_0x4e1093.type !== "character") {
      throw new Error("Object is not a character: " + _0x4e1093.id);
    }
    if (_0x4e1093.locked) {
      throw new Error("Object is locked: " + _0x4e1093.id);
    }
    if (!ACTION_IDS.has(_0x3ebc77.actionId)) {
      throw new Error("Character action does not exist: " + _0x3ebc77.actionId);
    }
    _0x4e1093.actionId = _0x3ebc77.actionId;
    _0x4e1093.actionTime = 0;
    return {
      changed: true,
      result: {
        objectId: _0x4e1093.id,
        actionId: _0x4e1093.actionId
      }
    };
  }
  if (_0x2618c2 === "setHandPose") {
    const _0x534e9a = requireObject(_0x4f978a, _0x3ebc77.objectId);
    if (_0x534e9a.type !== "character") {
      throw new Error("Object is not a character: " + _0x534e9a.id);
    }
    if (_0x534e9a.locked) {
      throw new Error("Object is locked: " + _0x534e9a.id);
    }
    if (!HAND_POSE_IDS.has(_0x3ebc77.poseId)) {
      throw new Error("Hand pose does not exist: " + _0x3ebc77.poseId);
    }
    _0x534e9a[_0x3ebc77.hand === "right" ? "rightHandPoseId" : "leftHandPoseId"] = _0x3ebc77.poseId;
    return {
      changed: true,
      result: {
        objectId: _0x534e9a.id,
        hand: _0x3ebc77.hand,
        poseId: _0x3ebc77.poseId
      }
    };
  }
  if (_0x2618c2 === "adjustCamera") {
    const _0x5c5696 = activeShot(_0x4f978a);
    if (!_0x5c5696) {
      throw new Error("Scene has no shot: " + _0x4f978a.id);
    }
    _0x5c5696.camera = {
      ..._0x5c5696.camera,
      position: [..._0x3ebc77.position],
      target: [..._0x3ebc77.target],
      focalLength: _0x3ebc77.focalLength
    };
    _0x5c5696.animation = upsertStoryboard3DCameraKeyframe(_0x5c5696.animation, {
      time: 0,
      camera: _0x5c5696.camera
    });
    _0x5c5696.updatedAt = _0x195b6f.now;
    return {
      changed: true,
      result: {
        shotId: _0x5c5696.id
      }
    };
  }
  if (_0x2618c2 === "addShot") {
    const _0xde9641 = resolveCamera(_0x4f978a, _0x195b6f.readCurrentCamera);
    const _0x53b37b = createStoryboard3DShot({
      sceneId: _0x4f978a.id,
      name: _0x3ebc77.name,
      description: _0x3ebc77.description,
      camera: _0xde9641,
      order: _0x4f978a.shots.length,
      now: _0x195b6f.now,
      idFactory: _0x195b6f.idFactory
    });
    _0x4f978a.shots.push(_0x53b37b);
    _0x4f978a.activeShotId = _0x53b37b.id;
    return {
      changed: true,
      result: {
        shotId: _0x53b37b.id
      }
    };
  }
  if (_0x2618c2 === "updateShot") {
    const _0x1ffe7e = requireShot(_0x4f978a, _0x3ebc77.shotId);
    if (_0x3ebc77.name) {
      _0x1ffe7e.name = _0x3ebc77.name;
    }
    if (_0x3ebc77.description) {
      _0x1ffe7e.description = _0x3ebc77.description;
    }
    if (_0x3ebc77.focalLength != null) {
      _0x1ffe7e.camera.focalLength = _0x3ebc77.focalLength;
      _0x1ffe7e.animation = upsertStoryboard3DCameraKeyframe(_0x1ffe7e.animation, {
        time: 0,
        camera: _0x1ffe7e.camera
      });
    }
    _0x1ffe7e.updatedAt = _0x195b6f.now;
    return {
      changed: true,
      result: {
        shotId: _0x1ffe7e.id
      }
    };
  }
  throw new Error("Unsupported safe storyboard tool: " + _0x2618c2);
}
export class Storyboard3DToolExecutionError extends Error {
  constructor(_0x52d4c0, {
    command: _0x347e0d,
    cause: _0x2204aa
  } = {}) {
    super(_0x52d4c0, {
      cause: _0x2204aa
    });
    this.name = "Storyboard3DToolExecutionError";
    this.commandId = _0x347e0d?.commandId || null;
    this.tool = _0x347e0d?.tool || null;
  }
}
export function createStoryboard3DSafeToolExecutor({
  projectStore: _0x5d23ed,
  assetLibrary = createStoryboard3DAssetLibrary(),
  idFactory: _0x349d93,
  now = () => Date.now(),
  readCurrentCamera: _0x142dcf
} = {}) {
  if (typeof _0x5d23ed?.getSnapshot !== "function") {
    throw new TypeError("A storyboard project store is required");
  }
  const _0x5bc9ed = _0x5d23ed.replaceProject || _0x5d23ed.load;
  if (typeof _0x5bc9ed !== "function") {
    throw new TypeError("The storyboard project store must support project replacement");
  }
  return async function _0x9a311b(_0xb7c10c, _0x1404a1 = {}) {
    const _0x129e90 = _0x5d23ed.getSnapshot();
    const _0x217085 = validateStoryboard3DAICommandPlan({
      transactionId: _0x1404a1.transactionId || createId("transaction", _0x349d93),
      commands: _0xb7c10c
    }, {
      sceneIds: _0x129e90.scenes.map(_0x55c5a6 => _0x55c5a6.id)
    });
    const _0x315fed = cloneStoryboard3DProject(_0x129e90);
    const _0x296125 = [];
    const _0x431311 = new Set();
    let _0xb0a12e = false;
    const _0x705f48 = now();
    for (const _0x4c8f14 of _0x217085.commands) {
      try {
        const _0x531ff1 = executeSafeTool(_0x315fed, _0x4c8f14, {
          assetLibrary: assetLibrary,
          idFactory: _0x349d93,
          now: _0x705f48,
          readCurrentCamera: _0x142dcf,
          usedAssetIds: _0x431311
        });
        _0xb0a12e ||= _0x531ff1.changed;
        _0x296125.push({
          commandId: _0x4c8f14.commandId,
          tool: _0x4c8f14.tool,
          changed: _0x531ff1.changed,
          result: _0x531ff1.result
        });
      } catch (_0x5bb114) {
        throw new Storyboard3DToolExecutionError("3D command failed: " + _0x4c8f14.tool + ": " + (_0x5bb114?.message || String(_0x5bb114)), {
          command: _0x4c8f14,
          cause: _0x5bb114
        });
      }
    }
    let _0x286534 = _0x129e90;
    if (_0xb0a12e) {
      _0x315fed.updatedAt = _0x705f48;
      _0x286534 = migrateStoryboard3DProject(_0x315fed, {
        now: _0x705f48,
        idFactory: _0x349d93
      });
      _0x5bc9ed.call(_0x5d23ed, _0x286534, "ai-transaction:" + _0x217085.transactionId);
      _0x431311.forEach(_0x19f143 => assetLibrary.markUsed(_0x19f143));
    }
    return {
      ok: true,
      transactionId: _0x217085.transactionId,
      changed: _0xb0a12e,
      commands: _0x296125,
      project: cloneStoryboard3DProject(_0x286534)
    };
  };
}
function resolveOption(_0x586826) {
  if (typeof _0x586826 === "function") {
    return _0x586826();
  } else {
    return _0x586826;
  }
}
export class Storyboard3DAIVoiceController {
  constructor({
    projectStore: _0x3422d3,
    model: _0x24d215,
    provider: _0x401b51,
    request: _0x38f376,
    executeTransaction: _0x2f08ee,
    assetLibrary: _0x59107f,
    idFactory: _0x2691e4,
    now: _0xb4d49b,
    readCurrentCamera: _0x3bdea4,
    voiceServiceFactory = createStoryboard3DVoiceInputService,
    windowObject = globalThis.window,
    onStateChange: _0x3fd1ac,
    onTranscript: _0x1e5778,
    onPlan: _0x5e0922,
    onExecution: _0x392898,
    onError: _0x544005
  } = {}) {
    if (typeof _0x3422d3?.getSnapshot !== "function") {
      throw new TypeError("A storyboard project store is required");
    }
    this.projectStore = _0x3422d3;
    this.assetLibrary = _0x59107f || createStoryboard3DAssetLibrary();
    this.model = _0x24d215;
    this.provider = _0x401b51;
    this.request = _0x38f376;
    this.executeTransaction = _0x2f08ee || createStoryboard3DSafeToolExecutor({
      projectStore: _0x3422d3,
      assetLibrary: this.assetLibrary,
      idFactory: _0x2691e4,
      now: _0xb4d49b,
      readCurrentCamera: _0x3bdea4
    });
    this.onStateChange = _0x3fd1ac;
    this.onTranscript = _0x1e5778;
    this.onPlan = _0x5e0922;
    this.onExecution = _0x392898;
    this.onError = _0x544005;
    this.state = {
      status: "idle",
      instruction: "",
      interimTranscript: "",
      plan: null,
      execution: null,
      error: null
    };
    this.runToken = 0;
    this.voiceService = voiceServiceFactory({
      windowObject: windowObject,
      onStateChange: _0x3af4ba => this._handleVoiceState(_0x3af4ba),
      onTranscript: _0x17f262 => this._handleTranscript(_0x17f262),
      onError: _0x457f30 => this._fail(_0x457f30)
    });
  }
  _setState(_0x566ad6, _0x926407) {
    this.state = {
      ...this.state,
      ..._0x566ad6
    };
    const _0x90085d = this.getSnapshot();
    this.onStateChange?.(_0x90085d, {
      reason: _0x926407
    });
    return _0x90085d;
  }
  _handleVoiceState(_0x3a669e) {
    if (["starting", "listening", "transcribing", "stopping"].includes(_0x3a669e.state)) {
      this._setState({
        status: _0x3a669e.state,
        error: null
      }, "voice-" + _0x3a669e.state);
    } else if (this.state.status !== "planning" && this.state.status !== "executing") {
      this._setState({
        status: "idle"
      }, "voice-idle");
    }
  }
  _handleTranscript(_0x4306b7) {
    this._setState({
      instruction: _0x4306b7.transcript,
      interimTranscript: _0x4306b7.interimText || "",
      error: null
    }, "voice-transcript");
    this.onTranscript?.(_0x4306b7);
  }
  _fail(_0x4bfd7f) {
    const _0x5a19d6 = _0x4bfd7f instanceof Error ? _0x4bfd7f : new Error(_0x4bfd7f?.message || String(_0x4bfd7f));
    this._setState({
      status: "error",
      error: _0x5a19d6
    }, "error");
    this.onError?.(_0x5a19d6);
    return _0x5a19d6;
  }
  setInstruction(_0x5b86dc) {
    return this._setState({
      instruction: normalizedText(_0x5b86dc),
      interimTranscript: "",
      error: null
    }, "set-instruction");
  }
  startVoice(_0x573ba0) {
    return this.voiceService.start(_0x573ba0);
  }
  stopVoice() {
    return this.voiceService.stop();
  }
  abortVoice() {
    return this.voiceService.abort();
  }
  async plan({
    instruction = this.state.instruction,
    model: _0x477e12,
    provider: _0x58ea62
  } = {}) {
    const _0x53a8b5 = ++this.runToken;
    this._setState({
      status: "planning",
      error: null,
      execution: null
    }, "planning");
    try {
      const _0x2c3310 = await generateStoryboard3DAICommandPlan({
        instruction: instruction,
        project: this.projectStore.getSnapshot(),
        model: normalizedText(_0x477e12 || resolveOption(this.model)),
        provider: normalizedText(_0x58ea62 || resolveOption(this.provider)),
        ...(this.request ? {
          request: this.request
        } : {}),
        assetLibrary: this.assetLibrary,
        onProgress: _0x5d6732 => this.onStateChange?.(this.getSnapshot(), {
          reason: _0x5d6732.stage,
          progress: _0x5d6732
        })
      });
      if (_0x53a8b5 !== this.runToken) {
        return null;
      }
      this._setState({
        status: "ready",
        plan: _0x2c3310
      }, "plan-ready");
      this.onPlan?.(_0x2c3310);
      return _0x2c3310;
    } catch (_0x4b39fe) {
      if (_0x53a8b5 !== this.runToken) {
        return null;
      }
      throw this._fail(_0x4b39fe);
    }
  }
  async executePlan(_0x512446 = this.state.plan) {
    if (!_0x512446) {
      throw this._fail(new Error("No 3D command plan is ready"));
    }
    const _0x2726cb = ++this.runToken;
    this._setState({
      status: "executing",
      error: null
    }, "executing");
    try {
      const _0x200675 = await executeStoryboard3DAICommandPlan(_0x512446, {
        executeTransaction: this.executeTransaction
      });
      if (_0x2726cb !== this.runToken) {
        return null;
      }
      this._setState({
        status: "completed",
        plan: _0x200675,
        execution: _0x200675.execution
      }, "completed");
      this.onExecution?.(_0x200675.execution, _0x200675);
      return _0x200675;
    } catch (_0x55fa3d) {
      if (_0x2726cb !== this.runToken) {
        return null;
      }
      throw this._fail(_0x55fa3d);
    }
  }
  async submit(_0x210dce = {}) {
    const _0x59917b = await this.plan(_0x210dce);
    if (!_0x59917b) {
      return null;
    }
    return this.executePlan(_0x59917b);
  }
  cancel() {
    this.runToken += 1;
    this.abortVoice();
    return this._setState({
      status: "idle",
      error: null
    }, "cancel");
  }
  getSnapshot() {
    return {
      ...this.state,
      plan: this.state.plan ? cloneStoryboard3DProject(this.state.plan) : null,
      execution: this.state.execution ? cloneStoryboard3DProject(this.state.execution) : null,
      voiceSupported: this.voiceService.isSupported?.() === true
    };
  }
  destroy() {
    this.runToken += 1;
    this.voiceService.destroy?.();
    this._setState({
      status: "idle"
    }, "destroy");
  }
}
export function createStoryboard3DAIVoiceController(_0x8967b2) {
  return new Storyboard3DAIVoiceController(_0x8967b2);
}