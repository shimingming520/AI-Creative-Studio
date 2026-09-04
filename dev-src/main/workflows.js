"use strict";
/**
 * 自定义工作流库（与 YUH Studio 本地生成引擎共用同一 ComfyUI 实例）。
 *
 * - listWorkflows: 扫描 ComfyUI user/default/workflows 目录（网页保存即同步）。
 * - convertUiToApi: ComfyUI 网页保存的 UI 格式 -> /prompt 需要的 API 格式。
 * - inspectWorkflow / detectSlots: 按节点类型启发式识别 提示词/宽高/时长/步数/种子/模型文件/素材/输出 槽位。
 * - validateAgainstBackend: 自定义节点存在性 + 模型文件是否在引擎注册列表。
 *
 * 本模块不依赖 electron，可在普通 node 中单测。
 */

const fs = require("fs");
const path = require("path");

const MAX_DEPTH = 8;
const MAX_FILE_BYTES = 20 * 1024 * 1024;

/**
 * 前端/注释类节点不注册到后端 object_info：
 * - ComfyUI 前端导出 API 时不会包含它们（注释、纯展示、模式控制节点）。
 * - 转换与校验时跳过，避免把未知 class_type 提交给 /prompt 导致 502。
 */
const FRONTEND_ONLY_NODE =
  /^(note|markdownnote|showtext\|pysssss|label(?: \(rgthree\))?|reroute(?: \(rgthree\))?|Fast Groups Bypasser \(rgthree\)|Fast Groups Muter \(rgthree\)|Fast Muter \(rgthree\)|Fast Bypasser \(rgthree\)|Mute \/ Bypass Repeater \(rgthree\)|Mute \/ Bypass Relay \(rgthree\)|Random Unmuter \(rgthree\)|Node Collector \(rgthree\)|Fast Actions Button \(rgthree\)|Bookmark \(rgthree\)|Copy Image \(rgthree\)|Node Combiner \(rgthree\))$/i;

/** 输出类节点：即使没有输出槽（如 SaveImage / ShowText），也属于执行终点，应保留 */
function isOutputNodeClass(cls) {
  return /(^|[^a-z])(save|preview|show|display|print|dump|log|export|write|combine|compose|concat|merge|screenshot|viewer|send|upload|showany|textgenerate)/i.test(
    cls,
  );
}

const SEED_INPUT = /^(seed|noise_seed)$/i;

const MODEL_FOLDER_GUESS = [
  [/^unet/i, "diffusion_models"],
  [/^(diffusion|model|di(t|f))/i, "diffusion_models"],
  [/^clip\b/i, "text_encoders"],
  [/^clip(_?name)?$/i, "text_encoders"],
  [/^(text_encoder|t5|llava|qwen)/i, "text_encoders"],
  [/^vae/i, "vae"],
  [/^lora/i, "loras"],
  [/^(ckpt|checkpoint)/i, "checkpoints"],
  [/^(control_net|controlnet)/i, "controlnet"],
  [/^style/i, "style_models"],
  [/^upscale/i, "upscale_models"],
  [/^audio/i, "audio_encoders"],
  [/^mmproj/i, "clip_vision"],
  [/^image_encoder/i, "clip_vision"],
  [/^(clip_vision|vision)/i, "clip_vision"],
];

const LOAD_CLASSES = [
  [/^loadimage/i, "image"],
  [/^(loadvideo|vhs_loadvideo|loadaudiovideo)/i, "video"],
  [/^(loadaudio|vhs_loadaudio|loadaudiorecap|audioloader)/i, "audio"],
];

const LOAD_INPUT_NAME = /^(image|images|file|video|audio|path|image_a|image_b|video_a|video_b)$/i;
const NON_FILE_PLACEHOLDER = /^(image|video|audio|file|upload)$/i;
const FILE_EXT = /\.(safetensors|png|jpe?g|webp|bmp|gif|mp4|webm|mov|mkv|mp3|wav|flac|m4a|ogg|sft|pt)$/i;

/* 音频生成工作流（TTS / 音色设计 / 文生音乐 / 音效）文本与时长槽位识别。
   detectSlots 同时服务视频/图像工作流，因此这些启发式只在图里出现音频类
   节点（Qwen3Voice / VoxCPM / Woosh / IndexTTS / StableAudio / MiniMax Music 3）
   时启用，避免把 CR Text / 提示词等通用节点误判进视频工作流。 */
const AUDIO_NODE_RE =
  /(Qwen3Voice|VoxCPM|Woosh|IndexTTS|StableAudio|Music3|Music_3|ac99f841|8b66c757|VoiceClone|VoiceDesign|AudioGenerate|TTS\b)/i;
const AUDIO_TEXT_INPUT_RE =
  /^(text|prompt|caption|user_input|lyrics|instruct|voice_design|ref_text|prompt_text)$/i;
const AUDIO_DURATION_INPUT_RE = /^(duration|max_duration|max_duration_s)$/i;
const AUDIO_MODEL_INPUT_RE = /^(sa_clip|qwen_clip)$/i;
const AUDIO_TEXT_LABELS = {
  text: "语音文本",
  prompt: "提示词",
  caption: "音乐描述",
  user_input: "音乐描述",
  lyrics: "歌词",
  instruct: "音色描述",
  voice_design: "音色描述",
  ref_text: "参考音频文本",
  prompt_text: "参考音频文本",
};

function workflowsRoot(comfyuiDir) {
  if (!comfyuiDir) return "";
  return path.join(comfyuiDir, "user", "default", "workflows");
}

function readJsonFile(filePath) {
  const stat = fs.statSync(filePath);
  if (stat.size > MAX_FILE_BYTES) throw new Error("文件过大（>20MB），跳过");
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function isUiFormat(raw) {
  return Boolean(raw && Array.isArray(raw.nodes) && Array.isArray(raw.links));
}

function isApiFormat(raw) {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return false;
  const values = Object.values(raw);
  return (
    values.length > 0 &&
    values.every((value) => value && typeof value === "object" && !Array.isArray(value)) &&
    values.some((value) => typeof value.class_type === "string")
  );
}

function walkJsonFiles(root) {
  const found = [];
  const walk = (dir, depth) => {
    if (depth > MAX_DEPTH) return;
    let entries;
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const entry of entries) {
      if (entry.name.startsWith(".")) continue;
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(full, depth + 1);
        continue;
      }
      if (!entry.isFile() || !entry.name.toLowerCase().endsWith(".json")) continue;
      found.push(full);
    }
  };
  if (fs.existsSync(root)) walk(root, 0);
  return found;
}

function listWorkflows(comfyuiDir) {
  const root = workflowsRoot(comfyuiDir);
  const items = walkJsonFiles(root).map((filePath) => {
    const stat = fs.statSync(filePath);
    const rel = path.relative(root, filePath).split(path.sep).join("/");
    const parsed = { path: filePath, relName: rel, mtimeMs: stat.mtimeMs, size: stat.size };
    try {
      const raw = readJsonFile(filePath);
      parsed.format = isUiFormat(raw) ? "ui" : isApiFormat(raw) ? "api" : "unknown";
      if (parsed.format === "ui") parsed.nodeCount = (raw.nodes || []).length;
      else if (parsed.format === "api") parsed.nodeCount = Object.keys(raw).length;
      else parsed.nodeCount = 0;
      parsed.nodeTypes = parsed.format === "unknown" ? [] : collectNodeTypes(raw).slice(0, 60);
    } catch (error) {
      parsed.format = "invalid";
      parsed.error = error instanceof Error ? error.message : String(error);
    }
    return parsed;
  });
  items.sort((a, b) => {
    const folderA = a.relName.includes("/") ? a.relName.split("/")[0] : "";
    const folderB = b.relName.includes("/") ? b.relName.split("/")[0] : "";
    if (folderA !== folderB) return folderA.localeCompare(folderB, "zh-CN");
    return a.relName.localeCompare(b.relName, "zh-CN");
  });
  return { root, items };
}

function collectNodeTypes(raw) {
  if (isUiFormat(raw)) {
    return [...new Set((raw.nodes || []).map((node) => node.type).filter(Boolean))];
  }
  if (isApiFormat(raw)) {
    return [...new Set(Object.values(raw).map((node) => node.class_type).filter(Boolean))];
  }
  return [];
}

function normalizeWidgetValue(value) {
  if (Array.isArray(value)) {
    if (value.length === 0) return void 0;
    const last = value[value.length - 1];
    if (typeof last === "string" || typeof last === "number" || typeof last === "boolean") {
      return last; // ComfyUI 组合框惯例：[候选..., 选中]
    }
    return value;
  }
  return value;
}

/**
 * UI 格式 -> API 格式。
 *
 * 关键规则（与 ComfyUI 前端导出一致）：
 * - 已连接的输入：从 links 表解析为 [源节点, 源槽位]。
 * - 组件输入：优先 widgets_values_named（新版本保存）；旧版本按 widget 输入顺序消费
 *   widgets_values——但 seed/noise_seed 这类带 control_after_generate 的双值组件
 *   会在数组里占两个位置（数值 + fixed/randomize），需要跳过。
 * - 无组件（widget）的未连接输入不消费 widgets_values。
 */
function convertUiToApi(raw) {
  if (!isUiFormat(raw)) {
    if (isApiFormat(raw)) return convertApiToApi(raw);
    throw new Error("无法识别工作流格式（既不是 UI 格式也没有 class_type 节点）");
  }
  const links = new Map();
  for (const link of raw.links || []) {
    if (Array.isArray(link) && link.length >= 5) links.set(link[0], link);
    else if (link && typeof link === "object" && link.id != null) links.set(link.id, link);
  }
  const prompt = {};
  const stats = { nodes: 0, skipped: 0, warnings: [] };
  for (const node of raw.nodes || []) {
    // mode: 2 = muted, 4 = bypassed（API 导出会跳过它们）
    if (node.mode === 2 || node.mode === 4) {
      stats.skipped += 1;
      continue;
    }
    if (!node.type) continue;
    // 前端/注释类节点不进入 API 图（与 ComfyUI 前端导出行为一致）
    if (FRONTEND_ONLY_NODE.test(node.type)) {
      stats.skipped += 1;
      continue;
    }
    // 没有任何输出槽且不属于输出类节点：纯展示/悬挂节点，不参与执行
    const hasOutputSlots = Array.isArray(node.outputs) && node.outputs.length > 0;
    if (!hasOutputSlots && !isOutputNodeClass(node.type)) {
      stats.skipped += 1;
      continue;
    }
    const inputs = {};
    const named = node.widgets_values_named || {};
    const rawValues = node.widgets_values || [];
    const widgetInputs = (node.inputs || []).filter((input) => input && input.widget != null);
    // 累计：该 widget 输入之前有多少 seed 类双值组件（它们占 2 个位置）
    let seedPairSeen = 0;
    let widgetCursor = 0;
    for (let index = 0; index < (node.inputs || []).length; index += 1) {
      const input = node.inputs[index];
      if (!input || !input.name) continue;
      if (input.link != null) {
        const link = links.get(input.link);
        if (!link) {
          stats.warnings.push(`节点 ${node.id}(${node.type}) 引用了不存在的链接 ${input.link}`);
          continue;
        }
        inputs[input.name] = [
          String(Array.isArray(link) ? link[1] : link.origin_id),
          Array.isArray(link) ? link[2] : link.origin_slot,
        ];
        // 已连接的组件输入仍占用 widgets_values 位置（如 KSampler 外接 seed）
        if (input.widget != null) {
          widgetCursor += 1;
          if (SEED_INPUT.test(input.name)) seedPairSeen += 1;
        }
        continue;
      }
      const widget = input.widget;
      if (widget == null) {
        // 无组件、未连接：仅在新版命名表中能找到时才带值
        if (Object.prototype.hasOwnProperty.call(named, input.name)) {
          inputs[input.name] = normalizeWidgetValue(named[input.name]);
        }
        continue;
      }
      let value;
      if (typeof widget === "number") {
        value = rawValues[widget];
        widgetCursor += 1;
        if (SEED_INPUT.test(input.name)) seedPairSeen += 1;
      } else if (typeof widget === "object" && widget.name) {
        if (Object.prototype.hasOwnProperty.call(named, widget.name)) {
          value = named[widget.name];
        } else if (Object.prototype.hasOwnProperty.call(named, input.name)) {
          value = named[input.name];
        } else {
          const consumeAt = widgetCursor + seedPairSeen;
          value = rawValues[consumeAt];
          widgetCursor += 1;
          if (SEED_INPUT.test(input.name)) seedPairSeen += 1;
        }
      }
      if (value !== undefined) inputs[input.name] = normalizeWidgetValue(value);
    }
    prompt[String(node.id)] = { class_type: node.type, inputs };
    stats.nodes += 1;
  }
  return { prompt, stats };
}

function convertApiToApi(raw) {
  const prompt = {};
  for (const [id, node] of Object.entries(raw)) {
    if (!node || typeof node.class_type !== "string") continue;
    const inputs = {};
    for (const [name, value] of Object.entries(node.inputs || {})) {
      if (Array.isArray(value) && value.length === 2 && typeof value[0] === "string" && typeof value[1] === "number") {
        inputs[name] = value; // 已是链接
      } else if (Array.isArray(value) && value.length === 2 && typeof value[0] === "number" && typeof value[1] === "number") {
        inputs[name] = [String(value[0]), value[1]]; // 兼容数字 ID 链接 → 字符串 ID
      } else {
        const normalized = normalizeWidgetValue(value);
        if (normalized !== undefined) inputs[name] = normalized;
      }
    }
    prompt[String(id)] = { class_type: node.class_type, inputs };
  }
  return { prompt, stats: { nodes: Object.keys(prompt).length, skipped: 0, warnings: [] } };
}

function nodeEntries(prompt) {
  return Object.entries(prompt).map(([id, node]) => ({ id, ...node }));
}

/**
 * 展开 ComfyUI 子图（新版本工作流 JSON 里的 definitions.subgraphs）。
 *
 * 这类工作流的顶层节点以“子图 UUID”作为 class_type（如 minimax_music_3 模板），
 * /prompt 无法直接执行（missing_node_type）。这里把调用节点替换为子图内部真实节点：
 * - 接口输入（链接 origin_id=-10）用调用节点的同名组件值替换；
 * - 接口输出（链接 target_id=-20）把下游对调用节点的引用改写为内部源节点；
 * - 内部节点 id 加前缀重命名，避免与顶层 id 冲突；嵌套子图递归展开。
 */
function expandSubgraphs(prompt, raw) {
  const subs = raw?.definitions?.subgraphs;
  if (!Array.isArray(subs) || !subs.length) return prompt;
  const subsById = new Map();
  for (const sg of subs) {
    if (sg && sg.id != null) subsById.set(String(sg.id), sg);
  }
  if (!subsById.size) return prompt;
  const graph = JSON.parse(JSON.stringify(prompt));
  const seen = new Set();
  for (let guard = 0; guard < 8; guard += 1) {
    const callIds = Object.keys(graph).filter((id) => subsById.has(String(graph[id]?.class_type)));
    if (!callIds.length) break;
    for (const callId of callIds) {
      if (seen.has(callId)) continue;
      seen.add(callId);
      const sg = subsById.get(String(graph[callId].class_type));
      const callNode = graph[callId];
      const defApi = convertUiToApi({ nodes: sg.nodes || [], links: sg.links || [] }).prompt;
      const idMap = new Map(Object.keys(defApi).map((key) => [key, `${callId}_${key}`]));
      // 接口输入端口名称（按槽位序）
      const portInNames = new Map((sg.inputs || []).map((port, index) => [index, port?.name]));
      const portInValues = new Map();
      for (const link of sg.links || []) {
        const origin = Array.isArray(link) ? link[1] : link.origin_id;
        const slot = Array.isArray(link) ? link[2] : link.origin_slot;
        if (origin === -10 && portInNames.has(slot)) {
          portInValues.set(slot, callNode.inputs?.[portInNames.get(slot)]);
        }
      }
      // 接口输出：槽位 -> 内部源节点
      const outPorts = new Map();
      for (const link of sg.links || []) {
        const target = Array.isArray(link) ? link[3] : link.target_id;
        const targetSlot = Array.isArray(link) ? link[4] : link.target_slot;
        if (target === -20) {
          const origin = Array.isArray(link) ? link[1] : link.origin_id;
          const originSlot = Array.isArray(link) ? link[2] : link.origin_slot;
          if (idMap.has(String(origin))) outPorts.set(targetSlot, [idMap.get(String(origin)), originSlot]);
        }
      }
      const expanded = {};
      for (const [key, node] of Object.entries(defApi)) {
        const inputs = {};
        for (const [name, value] of Object.entries(node.inputs || {})) {
          if (Array.isArray(value) && typeof value[0] === "string") {
            if (value[0] === "-10" && portInValues.has(value[1])) {
              const portValue = portInValues.get(value[1]);
              if (portValue !== undefined) inputs[name] = portValue;
            } else if (idMap.has(value[0])) {
              inputs[name] = [idMap.get(value[0]), value[1]];
            } else {
              inputs[name] = value;
            }
          } else {
            inputs[name] = value;
          }
        }
        expanded[idMap.get(key)] = { class_type: node.class_type, inputs };
      }
      // 下游对调用节点的引用 -> 内部输出源
      for (const node of Object.values(graph)) {
        for (const [name, value] of Object.entries(node.inputs || {})) {
          if (
            Array.isArray(value) &&
            value[0] === callId &&
            outPorts.has(value[1])
          ) {
            node.inputs[name] = outPorts.get(value[1]);
          }
        }
      }
      delete graph[callId];
      Object.assign(graph, expanded);
    }
  }
  return graph;
}

function nodeTitle(node) {
  return node.title && node.title !== node.class_type ? node.title : node.class_type;
}

function isModelFileName(value) {
  return typeof value === "string" && /\.(safetensors|ckpt|pt|pth|gguf|sft|bin)$/i.test(value);
}

function guessFolderForInput(inputName) {
  const base = inputName.replace(/^_+|_+$/g, "");
  for (const [pattern, folder] of MODEL_FOLDER_GUESS) {
    if (pattern.test(base)) return folder;
  }
  return "";
}

function isSeedNodeClass(cls) {
  return /(ksampler|sampler|noise|seed|random)/i.test(cls);
}

function isLlmNodeClass(cls) {
  return /(llama|llm|instruct|chat|glm|ollama)/i.test(cls);
}

function inferFileKind(nodeClass, inputName, value) {
  if (typeof value !== "string") return "";
  if (LOAD_INPUT_NAME.test(inputName) && NON_FILE_PLACEHOLDER.test(value)) return "";
  for (const [pattern, kind] of LOAD_CLASSES) {
    if (pattern.test(nodeClass) && LOAD_INPUT_NAME.test(inputName) && !NON_FILE_PLACEHOLDER.test(value)) {
      return kind;
    }
  }
  if (/\.(mp4|webm|mov|mkv)$/i.test(value)) return "video";
  if (/\.(mp3|wav|flac|m4a|ogg)$/i.test(value)) return "audio";
  if (FILE_EXT.test(value)) return "image";
  return "";
}

/** 启发式槽位识别：参数（可被面板改写）、模型文件、素材、输出节点 */
function detectSlots(prompt) {
  const nodes = nodeEntries(prompt);
  const slotCandidates = {
    prompt: [],
    width: [],
    height: [],
    length: [],
    duration: [],
    steps: [],
    seed: [],
    cfg: [],
    fps: [],
  };
  const modelSlots = [];
  const fileSlots = [];
  const outputNodes = [];
  const textSlots = []; // 音频工作流的文本输入（语音文本/音色描述/歌词等）
  const isAudioGraph = nodes.some((node) => AUDIO_NODE_RE.test(String(node.class_type || "")));

  for (const node of nodes) {
    const cls = String(node.class_type || "");
    const inputEntries = Object.entries(node.inputs || {});
    const isH3 = /^MiniMaxH3/i.test(cls);
    const isTextEncoder = /TextEncode/i.test(cls);

    if (isH3 && inputEntries.some(([name]) => name === "prompt")) {
      slotCandidates.prompt.push({ nodeId: node.id, input: "prompt", label: nodeTitle(node) });
    }
    if (isTextEncoder) {
      for (const [name, value] of inputEntries) {
        if ((name === "text" || name === "positive") && typeof value === "string") {
          slotCandidates.prompt.push({ nodeId: node.id, input: name, label: nodeTitle(node) });
        }
      }
    }
    if (isAudioGraph) {
      for (const [name, value] of inputEntries) {
        if (AUDIO_TEXT_INPUT_RE.test(name) && typeof value === "string") {
          if (name === "text" || name === "prompt") {
            slotCandidates.prompt.push({ nodeId: node.id, input: name, label: nodeTitle(node) });
          }
          // CR Text / CR Prompt Text 等通用文本节点按“提示词”标注，而非 TTS 语义标签
          const genericTextNode = /(?:CR\s*(?:Prompt\s*)?Text|ShowText|easy\s*showAnything|Text\b)/i.test(cls);
          const label = genericTextNode
            ? name === "prompt" || name === "text"
              ? "提示词"
              : AUDIO_TEXT_LABELS[name] || name
            : AUDIO_TEXT_LABELS[name] || name;
          textSlots.push({
            nodeId: node.id,
            input: name,
            nodeClass: cls,
            nodeTitle: nodeTitle(node),
            value,
            label,
          });
        }
      }
    }

    for (const [name, value] of inputEntries) {
      if (typeof value === "string") continue;
      if (name === "width" && typeof value === "number") {
        slotCandidates.width.push({ nodeId: node.id, input: name, label: nodeTitle(node) });
      } else if (name === "height" && typeof value === "number") {
        slotCandidates.height.push({ nodeId: node.id, input: name, label: nodeTitle(node) });
      } else if (/^(length|frames|frame_count|num_frames)$/i.test(name) && typeof value === "number") {
        slotCandidates.length.push({ nodeId: node.id, input: name, label: nodeTitle(node) });
      } else if (isAudioGraph && AUDIO_DURATION_INPUT_RE.test(name) && typeof value === "number") {
        slotCandidates.duration.push({ nodeId: node.id, input: name, label: nodeTitle(node) });
      } else if (/^(steps|step_count|max_steps)$/i.test(name) && typeof value === "number") {
        slotCandidates.steps.push({ nodeId: node.id, input: name, label: nodeTitle(node) });
      } else if (SEED_INPUT.test(name) && (typeof value === "number" || typeof value === "string")) {
        if (!isLlmNodeClass(cls)) {
          slotCandidates.seed.push({ nodeId: node.id, input: name, label: nodeTitle(node) });
        }
      } else if (/^(cfg|guidance)$/i.test(name) && typeof value === "number") {
        slotCandidates.cfg.push({ nodeId: node.id, input: name, label: nodeTitle(node) });
      } else if (name === "fps" && typeof value === "number") {
        slotCandidates.fps.push({ nodeId: node.id, input: name, label: nodeTitle(node) });
      }
    }

    for (const [name, value] of inputEntries) {
      if (/_name(?:_\d+)?$/i.test(name) && isModelFileName(value)) {
        modelSlots.push({
          nodeId: node.id,
          input: name,
          nodeClass: cls,
          nodeTitle: nodeTitle(node),
          value,
          folderGuess: guessFolderForInput(name),
        });
      } else if (AUDIO_MODEL_INPUT_RE.test(name) && isModelFileName(value)) {
        // StableAudio3 子图中的文本编码器选择器（sa_clip / qwen_clip）
        modelSlots.push({
          nodeId: node.id,
          input: name,
          nodeClass: cls,
          nodeTitle: nodeTitle(node),
          value,
          folderGuess: "text_encoders",
        });
      }
    }

    for (const [name, value] of inputEntries) {
      // 前端伪输入（audioUI/imageUI/videoUI/upload 等）不是真实 API 输入，跳过
      if (/UI$/i.test(name) || /^upload$/i.test(name)) continue;
      // 模型文件输入不算素材上传槽位
      if (/_name(?:_\d+)?$/i.test(name) && isModelFileName(value)) continue;
      if (AUDIO_MODEL_INPUT_RE.test(name) && isModelFileName(value)) continue;
      const kind = inferFileKind(cls, name, value);
      if (!kind) continue;
      fileSlots.push({ nodeId: node.id, input: name, nodeClass: cls, nodeTitle: nodeTitle(node), kind, value });
    }

    if (/(^|[^a-z])(save|create|combine|compose)/i.test(cls) ||
        (/(save|preview)/i.test(cls) &&
          inputEntries.some(([name]) => /^(filename_prefix|filename|video|images|audio)$/i.test(name)))) {
      const prefix = inputEntries.find(([name]) => name === "filename_prefix")?.[1];
      outputNodes.push({
        nodeId: node.id,
        classType: cls,
        title: nodeTitle(node),
        filenamePrefix: typeof prefix === "string" ? prefix : "",
      });
    }
  }
  return { slotCandidates, modelSlots, fileSlots, outputNodes, textSlots, isAudioGraph };
}

function currentSlotValues(prompt, slots) {
  const out = {};
  for (const key of Object.keys(slots)) {
    const candidate = (slots[key] || [])[0];
    if (!candidate) continue;
    const value = prompt[candidate.nodeId]?.inputs?.[candidate.input];
    if (value !== undefined) out[key] = value;
  }
  return out;
}

function inspectWorkflow(filePath) {
  const raw = readJsonFile(filePath);
  const { prompt, stats } = isUiFormat(raw) ? convertUiToApi(raw) : convertApiToApi(raw);
  // 子图（definitions.subgraphs）工作流：展开后可被 /prompt 直接执行
  const api = expandSubgraphs(prompt, raw);
  const { slotCandidates, modelSlots, fileSlots, outputNodes, textSlots, isAudioGraph } = detectSlots(api);
  return {
    raw,
    api,
    format: isUiFormat(raw) ? "ui" : "api",
    nodeCount: stats.nodes,
    skippedNodes: stats.skipped,
    warnings: stats.warnings,
    nodeTypes: collectNodeTypes(raw),
    slots: slotCandidates,
    slotValues: currentSlotValues(api, slotCandidates),
    modelSlots,
    fileSlots,
    outputNodes,
    textSlots,
    isAudioGraph,
  };
}

/** 用面板参数/模型文件覆盖值写回 converted API（浅拷贝，不修改原始工作流） */
function applyOverrides(api, slots, overrides = {}) {
  const graph = JSON.parse(JSON.stringify(api));
  const setFirst = (key, value) => {
    if (value === undefined || value === "" || value === null) return;
    const candidate = (slots[key] || [])[0];
    if (!candidate) return;
    const node = graph[candidate.nodeId];
    if (node && node.inputs) node.inputs[candidate.input] = value;
  };
  setFirst("prompt", overrides.prompt);
  setFirst("width", overrides.width);
  setFirst("height", overrides.height);
  setFirst("length", overrides.length);
  setFirst("duration", overrides.duration);
  setFirst("steps", overrides.steps);
  setFirst("seed", overrides.seed);
  setFirst("cfg", overrides.cfg);
  setFirst("fps", overrides.fps);
  for (const [key, value] of Object.entries(overrides.modelFiles || {})) {
    const [nodeId, input] = key.split("::");
    const node = graph[nodeId];
    if (node && node.inputs) node.inputs[input] = value;
  }
  // 音频工作流文本槽位（语音文本 / 音色描述 / 歌词 / 参考音频文本等）
  for (const [key, value] of Object.entries(overrides.textOverrides || {})) {
    if (typeof value !== "string") continue;
    const [nodeId, input] = key.split("::");
    const node = graph[nodeId];
    if (node && node.inputs) node.inputs[input] = value;
  }
  return graph;
}

/** 把上传后的素材名写回素材输入（按 类型匹配 + 出现顺序） */
function assignUploadedFiles(graph, fileSlots, uploaded) {
  const used = new Set();
  for (const slot of fileSlots) {
    const index = uploaded.findIndex((item, i) => !used.has(i) && item.kind === slot.kind);
    if (index < 0) continue;
    const node = graph[slot.nodeId];
    if (node && node.inputs) node.inputs[slot.input] = uploaded[index].name;
    used.add(index);
  }
  return graph;
}

/** 计算可达图：从没有下游链接的“输出/悬空节点”反向遍历，删除不可达节点（如备选分支） */
function pruneUnreachable(prompt) {
  const graph = JSON.parse(JSON.stringify(prompt));
  const incoming = new Map(); // nodeId -> Set of source node ids
  const hasOutgoing = new Set();
  for (const [nodeId, node] of Object.entries(graph)) {
    for (const value of Object.values(node.inputs || {})) {
      if (Array.isArray(value) && typeof value[0] === "string" && typeof value[1] === "number") {
        const source = String(value[0]);
        if (!incoming.has(nodeId)) incoming.set(nodeId, new Set());
        incoming.get(nodeId).add(source);
        hasOutgoing.add(source);
      }
    }
  }
  const reachable = new Set();
  const stack = Object.keys(graph).filter((nodeId) => !hasOutgoing.has(nodeId));
  while (stack.length) {
    const nodeId = stack.pop();
    if (reachable.has(nodeId)) continue;
    reachable.add(nodeId);
    for (const source of incoming.get(nodeId) || []) stack.push(source);
  }
  for (const nodeId of Object.keys(graph)) {
    if (!reachable.has(nodeId)) delete graph[nodeId];
  }
  return graph;
}

/** 运行时前校验：自定义节点存在性 + 模型文件是否在引擎注册列表中 */
async function validateAgainstBackend(host, graph, modelSlots) {
  const result = { backendReachable: true, nodeIssues: [], modelIssues: [], checkedNodes: 0 };
  if (!host) return { ...result, backendReachable: false };

  const classCache = new Map();
  const specCache = new Map();
  for (const classType of [...new Set(Object.values(graph).map((node) => node.class_type))]) {
    if (FRONTEND_ONLY_NODE.test(classType)) continue;
    result.checkedNodes += 1;
    let present = classCache.get(classType);
    if (present === undefined) {
      try {
        const response = await fetch(`${host}/object_info/${encodeURIComponent(classType)}`, {
          signal: AbortSignal.timeout(8000),
        });
        let spec = null;
        if (response.ok) {
          try {
            const data = await response.json();
            spec = data?.[classType];
          } catch {
            spec = null;
          }
        }
        present = Boolean(spec);
        if (present) specCache.set(classType, spec);
      } catch {
        return { ...result, backendReachable: false };
      }
      classCache.set(classType, present);
    }
    if (!present) {
      result.nodeIssues.push({ classType, message: `缺少自定义节点：${classType}（请安装/更新该 ComfyUI 自定义节点）` });
    }
  }

  // 枚举值检查（避免提交后的 Value not in list）
  for (const [nodeId, node] of Object.entries(graph)) {
    const spec = specCache.get(node.class_type);
    if (!spec || !spec.input) continue;
    const specInputs = { ...(spec.input.required || {}), ...(spec.input.optional || {}) };
    for (const [name, value] of Object.entries(node.inputs || {})) {
      const specEntry = specInputs[name];
      if (!Array.isArray(specEntry) || specEntry[0] !== "COMBO") continue;
      const options = Array.isArray(specEntry[1]) ? specEntry[1] : [];
      if (!options.length || typeof value !== "string") continue;
      if (!options.some((option) => String(option).toLowerCase() === value.toLowerCase())) {
        result.nodeIssues.push({
          classType: node.class_type,
          message: `节点 ${nodeId}(${node.class_type}) 的 ${name} 候选值无效：${value}`,
        });
      }
    }
  }

  const folders = [...new Set([
    "diffusion_models", "text_encoders", "vae", "loras", "checkpoints", "unet",
    "clip", "clip_vision", "controlnet", "upscale_models", "style_models",
    "audio_encoders", "embeddings", "LLM",
  ])];
  let modelLists;
  try {
    modelLists = {};
    for (const folder of folders) {
      const response = await fetch(`${host}/models/${folder}`, { signal: AbortSignal.timeout(5000) });
      if (response.ok) modelLists[folder] = await response.json();
    }
  } catch {
    return { ...result, backendReachable: false };
  }
  const norm = (s) => String(s || "").replace(/\\/g, "/").toLowerCase();
  for (const slot of modelSlots) {
    const node = graph[slot.nodeId];
    const value = node?.inputs?.[slot.input];
    if (typeof value !== "string") continue;
    const wanted = norm(value).replace(/^.*\//, "");
    const foundEntry = Object.entries(modelLists).find(([, list]) =>
      Array.isArray(list) && list.some((name) => norm(name).replace(/^.*\//, "") === wanted),
    );
    const folder = foundEntry ? foundEntry[0] : "";
    result.modelIssues.push({
      nodeId: slot.nodeId,
      input: slot.input,
      nodeTitle: slot.nodeTitle,
      value,
      folderGuess: slot.folderGuess,
      found: Boolean(folder),
      folder: folder || slot.folderGuess,
      candidates: (modelLists[folder || slot.folderGuess] || []).slice(-80),
    });
  }
  return result;
}

/**
 * 提交前把模型文件槽位值按「文件名」重映射为引擎实际候选名。
 *
 * 背景：应用内引擎（自建运行时 + extra_model_paths 把类型映射到模型根目录）与
 * ComfyUI Desktop 实例的候选名格式不同（例如 loras 前缀、子目录分隔符差异），
 * 工作流里保存的是网页端保存时的名字，直接提交会 value_not_in_list 报 502。
 * 校验阶段已经用 basename 匹配判断 found，这里对「basename 相同但字符串不同」
 * 的槽位替换为引擎候选名；已精确匹配或找不到候选的保持原值。
 */
async function remapModelValues(graph, modelSlots, host) {
  if (!host || !Array.isArray(modelSlots) || !modelSlots.length) return graph;
  const folders = [...new Set(
    modelSlots.map((slot) => slot.folder || slot.folderGuess || "").filter(Boolean),
  )];
  const lists = {};
  for (const folder of folders) {
    try {
      const response = await fetch(`${host}/models/${encodeURIComponent(folder)}`, {
        signal: AbortSignal.timeout(5000),
      });
      if (response.ok) lists[folder] = await response.json();
    } catch {
      // 忽略不可达目录
    }
  }
  if (!Object.keys(lists).length) return graph;
  const norm = (s) => String(s || "").replace(/\\/g, "/").toLowerCase();
  const out = JSON.parse(JSON.stringify(graph));
  for (const slot of modelSlots) {
    const node = out[slot.nodeId];
    const value = node?.inputs?.[slot.input];
    if (typeof value !== "string") continue;
    const list = lists[slot.folder || slot.folderGuess];
    if (!Array.isArray(list) || !list.length) continue;
    if (list.some((name) => String(name) === value)) continue; // 已精确匹配
    const base = norm(value).replace(/^.*\//, "");
    const candidate = list.find((name) => norm(name).replace(/^.*\//, "") === base);
    if (candidate) node.inputs[slot.input] = candidate;
  }
  return out;
}

/**
 * 补齐转换后缺失的必填输入（online）：UI JSON 里部分组件的值（如 easy 节点的
 * download_from / 隐藏 COMBO）没有对应的 inputs 条目，convertUiToApi 不会写入，
 * 提交时会报 "Required input is missing"。这里按后端节点定义的组件顺序，把
 * widgets_values 里未消费的值补进 API 输入；按钮类必填输入补 true。
 */
async function completeRequiredInputs(api, rawUi, host) {
  if (!host || !rawUi) return api;
  const uiById = new Map();
  for (const node of rawUi.nodes || []) uiById.set(String(node.id), node);
  const defCache = new Map();
  const out = JSON.parse(JSON.stringify(api));
  const isWidgetLike = (spec) =>
    Array.isArray(spec) &&
    typeof spec[0] === "string" &&
    /^(COMBO|INT|FLOAT|STRING|BOOLEAN|TEXT)$/i.test(spec[0]);
  const isButton = (spec) =>
    Array.isArray(spec) &&
    typeof spec[0] === "string" &&
    (spec[0] === "*" || spec[1]?.shape === 6 || spec[1]?.shape === 7);
  for (const [id, node] of Object.entries(out)) {
    const uiNode = uiById.get(id);
    let def = defCache.get(node.class_type);
    if (def === undefined) {
      def = null;
      try {
        const res = await fetch(
          `${host}/object_info/${encodeURIComponent(String(node.class_type))}`,
          { signal: AbortSignal.timeout(15000) },
        );
        const json = await res.json();
        def = json?.[String(node.class_type)] || null;
      } catch {
        // 离线时跳过
      }
      defCache.set(node.class_type, def);
    }
    const required = def?.input?.required;
    if (!required) continue;
    const missing = Object.keys(required).filter(
      (name) => !(name in (node.inputs || {})),
    );
    if (!missing.length) continue;
    const optional = def.input.optional || {};
    const widgetOrder = [...Object.keys(required), ...Object.keys(optional)].filter(
      (name) => isWidgetLike(required[name] ?? optional[name]),
    );
    const indexOf = new Map();
    let cursor = 0;
    for (const name of widgetOrder) {
      indexOf.set(name, cursor);
      cursor += SEED_INPUT.test(name) ? 2 : 1;
    }
    const allWidgets = uiNode?.widgets_values || [];
    for (const name of missing) {
      const spec = required[name];
      if (!Array.isArray(spec) || typeof spec[0] !== "string") continue;
      let value;
      if (isButton(spec)) {
        value = true;
      } else if (isWidgetLike(spec)) {
        const idx = indexOf.has(name) ? indexOf.get(name) : -1;
        value = idx >= 0 ? normalizeWidgetValue(allWidgets[idx]) : undefined;
        if (value === undefined && spec[1]?.default !== undefined) {
          value = normalizeWidgetValue(spec[1].default);
        }
        if (
          value === undefined &&
          spec[0] === "COMBO" &&
          Array.isArray(spec[1]?.options) &&
          spec[1].options.length
        ) {
          value = spec[1].options[0];
        }
      }
      if (value !== undefined) {
        if (!node.inputs) node.inputs = {};
        node.inputs[name] = value;
      }
    }
  }
  return out;
}

module.exports = {
  workflowsRoot,
  listWorkflows,
  inspectWorkflow,
  convertUiToApi,
  convertApiToApi,
  detectSlots,
  applyOverrides,
  assignUploadedFiles,
  pruneUnreachable,
  validateAgainstBackend,
  remapModelValues,
  completeRequiredInputs,
  isUiFormat,
  isApiFormat,
  normalizeWidgetValue,
};
