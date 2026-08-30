import { normalizeVideoGenerationResult } from "../../components/video-node/videoGenerationResultRenderer.js";
import { buildStoryClipCanvasBindingKey, buildStoryLinkedCanvasName } from "./storyCanvasBinding.js";
function asObject(_0x4c10ad) {
  if (_0x4c10ad && typeof _0x4c10ad === "object" && !Array.isArray(_0x4c10ad)) {
    return _0x4c10ad;
  } else {
    return {};
  }
}
function normalizeText(_0x5de030) {
  return String(_0x5de030 || "").trim();
}
function normalizeActiveIndex(_0x5c9e17, _0x25ef61) {
  const _0x2b87ca = Number(_0x5c9e17);
  if (!Number.isFinite(_0x2b87ca) || _0x25ef61 <= 0) {
    return 0;
  }
  return Math.max(0, Math.min(_0x25ef61 - 1, Math.trunc(_0x2b87ca)));
}
export function buildStoryEpisodeCanvasName(_0x6e8e5a = {}) {
  const _0x5a4f55 = Number(_0x6e8e5a.number || 0);
  return [_0x5a4f55 > 0 ? "第 " + _0x5a4f55 + " 集" : "分集", normalizeText(_0x6e8e5a.title)].filter(Boolean).join(" · ");
}
export function buildStoryClipCanvasNodeData({
  project = {},
  episode = {},
  clip = {},
  modelId = "",
  provider = "",
  generationParams = {},
  generationValidation = null
} = {}) {
  const _0x3bfa63 = asObject(clip.video);
  const _0xddfcb5 = Array.isArray(_0x3bfa63.results) ? _0x3bfa63.results : [];
  const _0x5d21d1 = normalizeVideoGenerationResult({
    videos: _0xddfcb5
  }).items;
  const _0x2f1cb9 = normalizeActiveIndex(_0x3bfa63.activeIndex, _0x5d21d1.length);
  const _0x3e7616 = _0x5d21d1[_0x2f1cb9] || {};
  const _0x4b11dd = Number(episode.number || 0);
  const _0x4ade89 = Number(clip.number || 0);
  const _0x541ea1 = normalizeText(generationValidation?.message || generationValidation);
  return {
    type: "ai-video",
    name: [_0x4b11dd > 0 ? "第 " + _0x4b11dd + " 集" : "分集", _0x4ade89 > 0 ? "片段 " + _0x4ade89 : "视频片段", normalizeText(clip.title), _0x541ea1 ? "⚠ 时长需调整" : ""].filter(Boolean).join(" · "),
    prompt: String(clip.prompt || ""),
    model: normalizeText(clip.modelId || clip.generation?.modelId || modelId),
    provider: normalizeText(clip.provider || clip.generation?.provider || provider),
    generationParams: {
      ...asObject(generationParams),
      ...asObject(clip.generationParams)
    },
    storyWorkspaceInputs: {
      ...asObject(clip.inputs)
    },
    videos: _0x5d21d1,
    mainVideoIndex: _0x2f1cb9,
    isVideosExpanded: false,
    videoUrl: normalizeText(_0x3e7616.videoUrl),
    localPath: normalizeText(_0x3e7616.localPath),
    displayLocalPath: normalizeText(_0x3e7616.displayLocalPath),
    posterLocalPath: normalizeText(_0x3e7616.posterLocalPath),
    thumbId: normalizeText(_0x3e7616.thumbId),
    thumbUrl: normalizeText(_0x3e7616.thumbUrl),
    storyWorkspaceBinding: {
      projectId: normalizeText(project.id),
      episodeId: normalizeText(episode.id),
      clipId: normalizeText(clip.id),
      kind: "clip-video",
      canvasScope: "project"
    },
    ...(_0x541ea1 ? {
      storyWorkspaceValidation: {
        generation: {
          status: "unsupported",
          message: _0x541ea1
        }
      }
    } : {})
  };
}
export function clearDeletedStoryCanvasBindings(_0x33ac66 = {}, {
  canvasId = "",
  nodes = []
} = {}) {
  if (!_0x33ac66 || typeof _0x33ac66 !== "object" || Array.isArray(_0x33ac66)) {
    return false;
  }
  const _0xe95003 = new Set((Array.isArray(nodes) ? nodes : []).map(_0x349dd8 => normalizeText(_0x349dd8?.id || _0x349dd8)).filter(Boolean));
  if (!_0xe95003.size) {
    return false;
  }
  const _0x51ab8a = normalizeText(canvasId);
  const _0x4745b8 = _0x5536cb => !_0x51ab8a || !normalizeText(_0x5536cb) || normalizeText(_0x5536cb) === _0x51ab8a;
  let _0x445a63 = false;
  const _0x11b77f = asObject(_0x33ac66.project?.canvasBinding);
  if (_0x4745b8(_0x11b77f.canvasId) && _0x11b77f.nodes) {
    const _0xe745f6 = {
      ...asObject(_0x11b77f.nodes)
    };
    for (const [_0x3c7e2f, _0x1f5c40] of Object.entries(_0xe745f6)) {
      if (!_0xe95003.has(normalizeText(_0x1f5c40))) {
        continue;
      }
      delete _0xe745f6[_0x3c7e2f];
      _0x445a63 = true;
    }
    if (_0x445a63) {
      _0x33ac66.project.canvasBinding = {
        ..._0x11b77f,
        nodes: _0xe745f6
      };
    }
  }
  for (const _0x5ba31d of Array.isArray(_0x33ac66.episodes) ? _0x33ac66.episodes : []) {
    const _0x526c97 = normalizeText(_0x5ba31d?.canvasId || _0x5ba31d?.canvasBinding?.canvasId);
    if (!_0x4745b8(_0x526c97)) {
      continue;
    }
    for (const _0x384b67 of Array.isArray(_0x5ba31d?.clips) ? _0x5ba31d.clips : []) {
      const _0x17e9fa = asObject(_0x384b67?.canvasBinding);
      if (!_0xe95003.has(normalizeText(_0x17e9fa.nodeId))) {
        continue;
      }
      delete _0x384b67.canvasBinding;
      _0x445a63 = true;
    }
  }
  if (Array.isArray(_0x33ac66.clipFrames)) {
    const _0x393037 = _0x33ac66.clipFrames.filter(_0x1d2654 => !_0xe95003.has(normalizeText(_0x1d2654?.canvasNodeId)) || !_0x4745b8(_0x1d2654?.canvasId));
    if (_0x393037.length !== _0x33ac66.clipFrames.length) {
      _0x33ac66.clipFrames = _0x393037;
      _0x445a63 = true;
    }
  }
  return _0x445a63;
}
export function createStoryEpisodeCanvasAdapter({
  canvasTabManager: _0x536fa3,
  createNodeAtCursor: _0x5e7ff2,
  getGraphState: _0x44c74e,
  getGraphSnapshot = null,
  restoreGraphSnapshot = null,
  updateNodeData: _0x818ec1,
  deleteNodes: _0x1117aa = null,
  focusNodes: _0x2c47e7 = null,
  getVideoNodeSize = () => ({
    width: 1024,
    height: 576
  }),
  commit = () => {}
} = {}) {
  if (typeof _0x536fa3?.addCanvas !== "function" || typeof _0x536fa3?.getActiveCanvasId !== "function" || typeof _0x5e7ff2 !== "function" || typeof _0x44c74e !== "function" || typeof _0x818ec1 !== "function") {
    throw new Error("story episode canvas adapter dependencies are incomplete");
  }
  const _0x9abe98 = _0x39587b => asObject(_0x44c74e()?.nodes)[normalizeText(_0x39587b)] || null;
  return {
    canvasExists(_0x5499b4) {
      const _0x404446 = normalizeText(_0x5499b4);
      if (!_0x404446) {
        return false;
      }
      const _0x2441e5 = _0x536fa3.getMultiDataSnapshot?.() || {};
      if (Array.isArray(_0x2441e5.canvases)) {
        return _0x2441e5.canvases.some(_0x132b83 => normalizeText(_0x132b83?.id) === _0x404446);
      } else {
        return normalizeText(_0x536fa3.getActiveCanvasId()) === _0x404446;
      }
    },
    async switchCanvas(_0xd96eb5) {
      const _0x2965ab = normalizeText(_0xd96eb5);
      if (!_0x2965ab) {
        return false;
      }
      if (normalizeText(_0x536fa3.getActiveCanvasId()) === _0x2965ab) {
        return true;
      }
      if (typeof _0x536fa3.switchTo !== "function") {
        return false;
      }
      return (await _0x536fa3.switchTo(_0x2965ab)) !== false;
    },
    async createCanvas(_0x3ba031) {
      await _0x536fa3.addCanvas();
      const _0x42fb53 = normalizeText(_0x536fa3.getActiveCanvasId());
      if (!_0x42fb53) {
        throw new Error("新建项目关联画布后未获得活动画布 ID");
      }
      _0x536fa3.renameCanvas?.(_0x42fb53, _0x3ba031);
      return _0x42fb53;
    },
    renameCanvas(_0x121af8, _0x32a21d) {
      _0x536fa3.renameCanvas?.(_0x121af8, _0x32a21d);
    },
    nodeExists(_0x4fe926) {
      return Boolean(_0x9abe98(_0x4fe926));
    },
    async createVideoNode(_0x24a349, {
      sequenceKey: _0x380850
    } = {}) {
      const _0x32b461 = asObject(getVideoNodeSize());
      const _0x58de81 = _0x5e7ff2("ai-video", Number(_0x32b461.width || 1024), Number(_0x32b461.height || 576), _0x24a349.name, {
        placement: "viewport-center-sequence",
        sequenceKey: _0x380850,
        skipCommit: true
      });
      if (!_0x58de81?.id) {
        throw new Error("创建分集视频节点失败");
      }
      const {
        type: _0x5281b1,
        ..._0x201f12
      } = _0x24a349;
      _0x818ec1(_0x58de81.id, _0x201f12);
      return _0x9abe98(_0x58de81.id) || {
        ..._0x58de81,
        ..._0x201f12,
        type: _0x58de81.type || _0x5281b1
      };
    },
    async updateVideoNode(_0x526e75, _0x26d55d) {
      const _0x1466f7 = normalizeText(_0x526e75);
      if (!_0x1466f7) {
        return null;
      }
      const {
        type: _0x33f3ac,
        ..._0x10deab
      } = _0x26d55d;
      _0x818ec1(_0x1466f7, _0x10deab);
      return _0x9abe98(_0x1466f7) || {
        id: _0x1466f7,
        type: _0x33f3ac || "ai-video",
        ..._0x10deab
      };
    },
    deleteNodes(_0x1143c4 = []) {
      if (typeof _0x1117aa !== "function") {
        return false;
      }
      const _0x24d385 = (Array.isArray(_0x1143c4) ? _0x1143c4 : []).map(normalizeText).filter(_0x1f8b01 => _0x1f8b01 && _0x9abe98(_0x1f8b01));
      if (!_0x24d385.length) {
        return true;
      }
      _0x1117aa([...new Set(_0x24d385)]);
      return true;
    },
    createMutationSnapshot() {
      if (typeof getGraphSnapshot !== "function") {
        return null;
      }
      return getGraphSnapshot();
    },
    restoreMutationSnapshot(_0x2445dc) {
      if (!_0x2445dc || typeof restoreGraphSnapshot !== "function") {
        return false;
      }
      return restoreGraphSnapshot(_0x2445dc) !== false;
    },
    async deleteCanvas(_0x598576) {
      const _0x42ce62 = normalizeText(_0x598576);
      if (!_0x42ce62 || typeof _0x536fa3?.deleteCanvas !== "function") {
        return false;
      }
      return (await _0x536fa3.deleteCanvas(_0x42ce62, {
        skipDirtyConfirm: true
      })) !== false;
    },
    focusNodes(_0x36b4f1, _0x4d75c9 = {}) {
      if (typeof _0x2c47e7 !== "function") {
        return false;
      }
      const _0x36315b = Array.isArray(_0x36b4f1) ? _0x36b4f1.map(normalizeText).filter(Boolean) : [];
      if (!_0x36315b.length) {
        return false;
      }
      return _0x2c47e7(_0x36315b, _0x4d75c9.padding, _0x4d75c9.durationMs, _0x4d75c9);
    },
    commit: commit
  };
}
async function rollbackStoryEpisodeCanvasMutation({
  adapter: _0x3cf3a0,
  canvasId = "",
  reused = false,
  mutationSnapshot: _0x124ed7
} = {}) {
  if (!reused && typeof _0x3cf3a0?.deleteCanvas === "function") {
    try {
      if ((await _0x3cf3a0.deleteCanvas(canvasId, {
        skipDirtyConfirm: true
      })) !== false) {
        return true;
      }
    } catch {}
  }
  if (_0x124ed7 && typeof _0x3cf3a0?.restoreMutationSnapshot === "function") {
    try {
      return (await _0x3cf3a0.restoreMutationSnapshot(_0x124ed7, {
        canvasId: canvasId
      })) !== false;
    } catch {}
  }
  return false;
}
export async function createStoryEpisodeCanvas({
  project = {},
  episode = {},
  modelId = "",
  provider = "",
  generationParams = {},
  resolveClipGenerationSettings = null,
  adapter: _0x50896f
} = {}) {
  const _0x57ba7e = ["canvasExists", "switchCanvas", "createCanvas", "nodeExists", "createVideoNode", "updateVideoNode"];
  if (_0x57ba7e.some(_0x1cb78c => typeof _0x50896f?.[_0x1cb78c] !== "function")) {
    throw new Error("createStoryEpisodeCanvas requires a complete canvas adapter");
  }
  const _0x337f81 = Array.isArray(episode.clips) ? episode.clips : [];
  const _0x4a9eb4 = await Promise.all(_0x337f81.map(async _0x4946fb => {
    try {
      const _0x45741f = typeof resolveClipGenerationSettings === "function" ? asObject(await resolveClipGenerationSettings(_0x4946fb)) : {};
      return {
        clip: _0x4946fb,
        modelId: normalizeText(_0x45741f.modelId) || modelId,
        provider: normalizeText(_0x45741f.provider) || provider,
        generationParams: Object.keys(asObject(_0x45741f.generationParams)).length ? _0x45741f.generationParams : generationParams,
        generationValidation: null
      };
    } catch (_0x12143f) {
      const _0x303d18 = Number(_0x4946fb?.durationSec || _0x4946fb?.durationSeconds || _0x4946fb?.duration);
      const _0xa20159 = normalizeText(_0x12143f?.message || _0x12143f);
      if (!(_0x303d18 > 0) || !/时长|duration/iu.test(_0xa20159)) {
        throw _0x12143f;
      }
      return {
        clip: _0x4946fb,
        modelId: modelId,
        provider: provider,
        generationParams: {
          ...asObject(generationParams),
          duration: _0x303d18
        },
        generationValidation: {
          message: _0xa20159
        }
      };
    }
  }));
  const _0x308786 = buildStoryLinkedCanvasName(project, episode);
  const _0x280b89 = asObject(project.canvasBinding);
  const _0x294cc6 = asObject(_0x280b89.nodes);
  const _0x3a6826 = normalizeText(_0x280b89.canvasId);
  const _0x4ec7e4 = _0x3a6826 && typeof _0x50896f.canvasExists === "function" && (await _0x50896f.canvasExists(_0x3a6826));
  let _0xf624bc = "";
  if (_0x4ec7e4) {
    const _0x56301f = await _0x50896f.switchCanvas?.(_0x3a6826);
    if (_0x56301f === false) {
      throw new Error("无法切换到已绑定的项目画布：" + _0x3a6826);
    }
    _0xf624bc = _0x3a6826;
  } else {
    _0xf624bc = await _0x50896f.createCanvas(_0x308786);
  }
  const _0x5c267b = "story-project:" + (normalizeText(project.id) || _0xf624bc) + ":episode:" + (normalizeText(episode.id) || "episode");
  const _0x5caaf0 = [];
  const _0x2b8856 = [];
  const _0x468850 = _0x4ec7e4 ? {
    ..._0x294cc6
  } : {};
  let _0x4bcdc7 = 0;
  let _0x1d8c08 = 0;
  let _0x29d1f0 = 0;
  const _0x1f1408 = _0x4a9eb4.map(({
    clip: _0x514ae7
  }, _0x6d0834) => buildStoryClipCanvasBindingKey({
    episode: episode,
    clip: _0x514ae7,
    clipIndex: _0x6d0834
  }));
  const _0x1f2dc7 = buildStoryClipCanvasBindingKey({
    episode: episode,
    clip: {
      id: "__story_episode_prefix__"
    }
  }).replace(/:clip:[^:]+$/u, ":clip:");
  const _0x207168 = Object.keys(_0x294cc6).filter(_0x40fc2f => _0x40fc2f.startsWith(_0x1f2dc7) && !_0x1f1408.includes(_0x40fc2f));
  const _0x11d3a7 = await _0x50896f.createMutationSnapshot?.({
    canvasId: _0xf624bc
  });
  try {
    if (_0x4ec7e4 && _0x207168.length) {
      const _0x4dddc1 = [];
      for (const _0x20ba02 of _0x207168) {
        const _0x20963f = normalizeText(_0x294cc6[_0x20ba02]);
        if (_0x20963f && (await _0x50896f.nodeExists(_0x20963f, _0xf624bc))) {
          _0x4dddc1.push(_0x20963f);
        }
      }
      if (_0x4dddc1.length) {
        if (typeof _0x50896f.deleteNodes !== "function") {
          throw new Error("剧本分集画布适配器缺少旧节点清理能力");
        }
        const _0x2c6d4b = [...new Set(_0x4dddc1)];
        if ((await _0x50896f.deleteNodes(_0x2c6d4b, {
          canvasId: _0xf624bc
        })) === false) {
          throw new Error("清理已失效的剧本分集画布节点失败");
        }
        _0x29d1f0 = _0x2c6d4b.length;
      }
      _0x207168.forEach(_0xff201b => {
        delete _0x468850[_0xff201b];
      });
    }
    for (let _0x25cb8d = 0; _0x25cb8d < _0x4a9eb4.length; _0x25cb8d += 1) {
      const _0x146403 = _0x4a9eb4[_0x25cb8d];
      const {
        clip: _0x4cfe1b
      } = _0x146403;
      const _0x2d4ec8 = _0x1f1408[_0x25cb8d];
      const _0x32fe7e = buildStoryClipCanvasNodeData({
        project: project,
        episode: episode,
        clip: _0x4cfe1b,
        modelId: _0x146403.modelId,
        provider: _0x146403.provider,
        generationParams: _0x146403.generationParams,
        generationValidation: _0x146403.generationValidation
      });
      const _0x223a24 = normalizeText(_0x294cc6[_0x2d4ec8]);
      const _0x193f84 = Boolean(_0x4ec7e4 && _0x223a24 && (await _0x50896f.nodeExists(_0x223a24, _0xf624bc)));
      if (_0x193f84) {
        _0x5caaf0.push(await _0x50896f.updateVideoNode(_0x223a24, _0x32fe7e, {
          canvasId: _0xf624bc,
          sequenceKey: _0x5c267b
        }));
        _0x1d8c08 += 1;
      } else {
        _0x5caaf0.push(await _0x50896f.createVideoNode(_0x32fe7e, {
          canvasId: _0xf624bc,
          sequenceKey: _0x5c267b
        }));
        _0x4bcdc7 += 1;
      }
      const _0x2ae2d3 = _0x5caaf0.at(-1);
      const _0x5aa927 = normalizeText(_0x2ae2d3?.id || (_0x193f84 ? _0x223a24 : ""));
      if (!_0x5aa927) {
        throw new Error("同步本集到项目画布失败：" + (_0x32fe7e.name || _0x2d4ec8));
      }
      _0x468850[_0x2d4ec8] = _0x5aa927;
      _0x2b8856.push({
        key: _0x2d4ec8,
        clipId: normalizeText(_0x4cfe1b.id),
        nodeId: _0x5aa927,
        canvasId: _0xf624bc
      });
    }
    _0x50896f.renameCanvas?.(_0xf624bc, _0x308786);
    _0x50896f.commit?.();
    if (typeof _0x50896f.focusNodes === "function" && _0x5caaf0.length) {
      await _0x50896f.focusNodes(_0x2b8856.map(_0x4fe0de => _0x4fe0de.nodeId), {
        padding: 80,
        durationMs: 0,
        maxZoom: 0.2
      });
    }
  } catch (_0x3d35f9) {
    await rollbackStoryEpisodeCanvasMutation({
      adapter: _0x50896f,
      canvasId: _0xf624bc,
      reused: Boolean(_0x4ec7e4),
      mutationSnapshot: _0x11d3a7
    });
    throw _0x3d35f9;
  }
  const _0x21533c = {
    ...(_0x4ec7e4 ? _0x280b89 : {}),
    canvasId: _0xf624bc,
    nodes: _0x468850,
    ...(_0x4ec7e4 && _0x280b89.layout ? {
      layout: {
        ...asObject(_0x280b89.layout)
      }
    } : {})
  };
  return {
    canvasId: _0xf624bc,
    canvasName: _0x308786,
    nodes: _0x5caaf0,
    reused: Boolean(_0x4ec7e4),
    createdCount: _0x4bcdc7,
    updatedCount: _0x1d8c08,
    deletedCount: _0x29d1f0,
    bindings: _0x2b8856,
    binding: _0x21533c,
    canvasBinding: _0x21533c
  };
}