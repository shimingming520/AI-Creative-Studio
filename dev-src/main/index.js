"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if ((from && typeof from === "object") || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, {
          get: () => from[key],
          enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable,
        });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (
  (target = mod != null ? __create(__getProtoOf(mod)) : {}),
  __copyProps(
    // If the importer is in node compatibility mode or this is not an ESM
    // file that has been converted to a CommonJS file using a Babel-
    // compatible transform (i.e. "__esModule" has not been set), then set
    // "default" to the CommonJS "module.exports" for node compatibility.
    isNodeMode || !mod || !mod.__esModule
      ? __defProp(target, "default", { value: mod, enumerable: true })
      : target,
    mod,
  )
);
const electron = require("electron");
const node_path = require("node:path");
const utils = require("@electron-toolkit/utils");
const node_fs = require("node:fs");
const node_crypto = require("node:crypto");
const node_url = require("node:url");
const node_child_process = require("node:child_process");
const promises = require("node:fs/promises");
const node_util = require("node:util");
const node_http = require("node:http");
const ws = require("ws");
const sharp = require("sharp");
const node_os = require("node:os");
const node_stream = require("node:stream");
// Serpent hosted integration (feasibility). Must load before app.ready because
// Serpent's main module registers privileged schemes at require time.
const serpentHost = require("../serpent-host");
serpentHost.preload();
const serpentSidebar = require("../serpent-sidebar");
const promises$1 = require("node:stream/promises");
const docx = require("docx");
const node_module = require("node:module");
const workflows = require("./workflows");
let desiredOwner = null;
let ownershipVersion = 0;
function requestGpuOwnership(owner) {
  if (desiredOwner !== owner) {
    desiredOwner = owner;
    ownershipVersion += 1;
  }
  return ownershipVersion;
}
function assertGpuOwnership(owner, version2) {
  if (desiredOwner !== owner || ownershipVersion !== version2) {
    throw new Error(
      owner === "vision"
        ? "视觉反推已被新的本地生成任务取代"
        : "本地生成已切换到视觉反推，请重新运行当前任务",
    );
  }
}
const SETTINGS_FILE$1 = "workspace-settings.json";
function settingsPath() {
  return node_path.join(electron.app.getPath("userData"), SETTINGS_FILE$1);
}
function legacyModelsDir() {
  const candidates = [
    node_path.resolve(electron.app.getAppPath(), "..", "models"),
    node_path.join(node_path.dirname(electron.app.getPath("exe")), "models"),
  ];
  return candidates.find(node_fs.existsSync) || "";
}
function legacyOutputDir() {
  const models = legacyModelsDir();
  if (!models) return "";
  const candidate = node_path.join(node_path.dirname(models), "outputs");
  return node_fs.existsSync(candidate) ? candidate : "";
}
function comfyuiCandidatesFromWorkspace(comfyuiDir) {
  const candidates = [];
  if (comfyuiDir?.trim()) candidates.push(node_path.resolve(comfyuiDir.trim()));
  if (process.env.COMFYUI_PATH?.trim())
    candidates.push(node_path.resolve(process.env.COMFYUI_PATH.trim()));
  return [...new Set(candidates)];
}
function hasConfiguredComfyui(comfyuiDir) {
  return comfyuiCandidatesFromWorkspace(comfyuiDir).some((directory) =>
    node_fs.existsSync(node_path.join(directory, "main.py")),
  );
}
function getWorkspaceSettings() {
  try {
    // 原版应用写出的 workspace-settings.json 带 UTF-8 BOM，JSON.parse 会直接
    // 抛 Unexpected token 并落入 catch 兜底（outputDir → 默认空目录），导致
    // 「生成资产 / ComfyUI 输出」一直指向 userData/outputs 而不是配置路径。
    let text = node_fs.readFileSync(settingsPath(), "utf8");
    if (text.charCodeAt(0) === 0xfeff) text = text.slice(1);
    const parsed = JSON.parse(text);
    const modelsDir =
      typeof parsed.modelsDir === "string" ? parsed.modelsDir : "";
    const outputDir2 =
      typeof parsed.outputDir === "string" ? parsed.outputDir : "";
    const comfyuiDir =
      typeof parsed.comfyuiDir === "string" && parsed.comfyuiDir.trim()
        ? node_path.resolve(parsed.comfyuiDir.trim())
        : process.env.COMFYUI_PATH?.trim()
          ? node_path.resolve(process.env.COMFYUI_PATH.trim())
          : "";
    const legacyMode = String(parsed.vramMode || "");
    const vramMode =
      legacyMode === "mid16"
        ? "mid24"
        : legacyMode === "high24"
          ? "ultra48"
          : ["auto", "low8", "low12", "mid24", "high32", "ultra48"].includes(
                legacyMode,
              )
            ? legacyMode
            : "auto";
    return {
      modelsDir,
      outputDir: outputDir2,
      comfyuiDir,
      configured: Boolean(
        parsed.configured &&
        modelsDir &&
        outputDir2 &&
        node_fs.existsSync(modelsDir),
      ) &&
        hasConfiguredComfyui(comfyuiDir),
      remoteBackendUrl:
        typeof parsed.remoteBackendUrl === "string"
          ? parsed.remoteBackendUrl
          : "",
      useRemoteBackend: Boolean(parsed.useRemoteBackend),
      // SageAttention 默认开启：首次安装/未配置时为 true（加速视频生成）
      // 只有用户显式设为 false 才关闭；这样符合"刚安装默认打开、用户关闭后保持关闭"的策略
      sageAttention:
        parsed.sageAttention === void 0 ? true : Boolean(parsed.sageAttention),
      vramMode,
    };
  } catch {
    return {
      modelsDir: legacyModelsDir(),
      outputDir: legacyOutputDir(),
      comfyuiDir: process.env.COMFYUI_PATH?.trim()
        ? node_path.resolve(process.env.COMFYUI_PATH.trim())
        : "",
      configured: false,
      sageAttention: true,
    };
  }
}
function saveWorkspaceSettings(input) {
  const previous = getWorkspaceSettings();
  const modelsDir = node_path.resolve(input.modelsDir.trim());
  const outputDir2 = node_path.resolve(input.outputDir.trim());
  if (!node_fs.existsSync(modelsDir)) throw new Error("所选模型文件夹不存在");
  node_fs.mkdirSync(outputDir2, { recursive: true });
  const comfyuiDir =
    typeof input.comfyuiDir === "string" && input.comfyuiDir.trim()
      ? node_path.resolve(input.comfyuiDir.trim())
      : previous.comfyuiDir ||
        (process.env.COMFYUI_PATH?.trim()
          ? node_path.resolve(process.env.COMFYUI_PATH.trim())
          : "");
  if (!hasConfiguredComfyui(comfyuiDir))
    throw new Error("请选择外部 ComfyUI 安装目录（根目录下应包含 main.py，例如 F:\\Comfy-Desktop）");
  const settings = {
    modelsDir,
    outputDir: outputDir2,
    comfyuiDir,
    configured: true,
    remoteBackendUrl: (input.remoteBackendUrl || "").trim(),
    useRemoteBackend: Boolean(input.useRemoteBackend),
    sageAttention: Boolean(input.sageAttention),
    vramMode: ["auto", "low8", "low12", "mid24", "high32", "ultra48"].includes(
      input.vramMode || "",
    )
      ? input.vramMode
      : "auto",
  };
  node_fs.mkdirSync(node_path.dirname(settingsPath()), { recursive: true });
  node_fs.writeFileSync(
    settingsPath(),
    JSON.stringify(settings, null, 2),
    "utf8",
  );
  return settings;
}
function configuredModelsDir() {
  return getWorkspaceSettings().modelsDir;
}
function configuredOutputDir() {
  return getWorkspaceSettings().outputDir;
}
const PORT$2 = 8190;
const LOCAL_HOST = `http://127.0.0.1:${PORT$2}`;
function getBackendHost() {
  try {
    const settings = getWorkspaceSettings();
    if (settings.useRemoteBackend && settings.remoteBackendUrl) {
      const base2 = settings.remoteBackendUrl.replace(/\/+$/, "");
      if (base2.includes(":18080")) {
        return base2 + "/comfyui";
      }
      return base2;
    }
  } catch {}
  return LOCAL_HOST;
}
function isRemoteMode() {
  try {
    const settings = getWorkspaceSettings();
    return Boolean(settings.useRemoteBackend && settings.remoteBackendUrl);
  } catch {
    return false;
  }
}
function getRemoteBackendOrigin() {
  try {
    const settings = getWorkspaceSettings();
    if (!settings.useRemoteBackend || !settings.remoteBackendUrl) return "";
    const u = new URL(settings.remoteBackendUrl);
    return `${u.protocol}//${u.host}`;
  } catch {
    return "";
  }
}
function defaultModelsDir() {
  return configuredModelsDir();
}
function detectedVramMode(totalMb) {
  if (!Number.isFinite(totalMb) || totalMb <= 0) return "low8";
  if (totalMb <= 10 * 1024) return "low8";
  if (totalMb <= 16 * 1024) return "low12";
  if (totalMb <= 28 * 1024) return "mid24";
  if (totalMb <= 40 * 1024) return "high32";
  return "ultra48";
}
function detectedGpuTotalMb() {
  const probe2 = node_child_process.spawnSync(
    "nvidia-smi",
    ["--query-gpu=memory.total", "--format=csv,noheader,nounits"],
    {
      windowsHide: true,
      encoding: "utf8",
      timeout: 5e3,
    },
  );
  if (probe2.status !== 0) return void 0;
  const totals = String(probe2.stdout || "")
    .trim()
    .split(/\r?\n/)
    .map(Number)
    .filter((value) => Number.isFinite(value) && value > 0);
  return totals.length ? Math.max(...totals) : void 0;
}
function effectiveVramMode(settings = getWorkspaceSettings()) {
  const selected = settings.vramMode || "auto";
  return selected === "auto"
    ? detectedVramMode(detectedGpuTotalMb() || 0)
    : selected;
}
function vramBudget(targetGb) {
  const probe2 = node_child_process.spawnSync(
    "nvidia-smi",
    ["--query-gpu=memory.total,memory.used", "--format=csv,noheader,nounits"],
    {
      windowsHide: true,
      encoding: "utf8",
      timeout: 5e3,
    },
  );
  if (probe2.status !== 0) return void 0;
  const [totalText, usedText] = String(probe2.stdout || "")
    .trim()
    .split(/\r?\n/)[0]
    .split(",")
    .map((value) => value.trim());
  const totalMb = Number(totalText);
  const usedMb = Number(usedText);
  if (!Number.isFinite(totalMb) || totalMb <= 0) return void 0;
  const totalGb = totalMb / 1024;
  const baselineGb = Number.isFinite(usedMb) ? usedMb / 1024 : 0;
  const engineBudgetGb = Math.max(0.75, targetGb - 0.25);
  const reserveGb = Math.max(
    0,
    Math.round((totalGb - engineBudgetGb) * 100) / 100,
  );
  return {
    reserveGb,
    engineBudgetGb: Math.round(engineBudgetGb * 100) / 100,
    totalGb,
    baselineGb: Math.round(baselineGb * 100) / 100,
    targetGb,
  };
}
const VIDEO_SUBDIRS = ["video", "video models", "video models"];
const IMAGE_SUBDIRS = ["image", "image models", "image models"];
const AUDIO_SUBDIRS = [
  "audio",
  "Qwen3-TTS-Models",
  "TTs models",
  "TTS models",
  "tts models",
  "tts",
];
function categoryDirs(category) {
  const root = defaultModelsDir();
  if (!node_fs.existsSync(root)) return [];
  const subdirNames =
    category === "video"
      ? VIDEO_SUBDIRS
      : category === "image"
        ? IMAGE_SUBDIRS
        : AUDIO_SUBDIRS;
  const dirs = [];
  for (const name of subdirNames) {
    const subdir = node_path.join(root, name);
    if (node_fs.existsSync(subdir) && !dirs.includes(subdir)) dirs.push(subdir);
  }
  dirs.push(root);
  return dirs;
}
function audioModelsDir() {
  const root = defaultModelsDir();
  if (!node_fs.existsSync(root)) return root;
  const candidates = AUDIO_SUBDIRS.map((name) => node_path.join(root, name));
  for (const dir of candidates) {
    if (!node_fs.existsSync(dir)) continue;
    try {
      for (const entry of node_fs.readdirSync(dir, { withFileTypes: true })) {
        if (!entry.isDirectory()) continue;
        const full = node_path.join(dir, entry.name);
        if (isTtsModelDir(full)) return dir;
      }
    } catch {}
  }
  for (const dir of candidates) if (node_fs.existsSync(dir)) return dir;
  return root;
}
function scanSafetensors(dirs) {
  const files = [];
  const seen = /* @__PURE__ */ new Set();
  for (const baseDir of dirs) {
    const walk = (directory) => {
      for (const entry of node_fs.readdirSync(directory, {
        withFileTypes: true,
      })) {
        const filePath2 = node_path.join(directory, entry.name);
        if (entry.isDirectory()) walk(filePath2);
        else if (entry.name.toLowerCase().endsWith(".safetensors")) {
          const rel = node_path.relative(baseDir, filePath2);
          if (seen.has(rel)) continue;
          seen.add(rel);
          files.push({
            name: rel,
            path: filePath2,
            size: node_fs.statSync(filePath2).size,
            baseDir,
          });
        }
      }
    };
    if (node_fs.existsSync(baseDir)) walk(baseDir);
  }
  return files;
}
function workspaceDir() {
  const dir = node_path.join(electron.app.getPath("userData"), "h3-runtime");
  node_fs.mkdirSync(dir, { recursive: true });
  return dir;
}
function inputDir() {
  const dir = node_path.join(workspaceDir(), "input");
  node_fs.mkdirSync(dir, { recursive: true });
  return dir;
}
function outputDir() {
  const dir =
    configuredOutputDir() ||
    node_path.join(electron.app.getPath("userData"), "outputs");
  node_fs.mkdirSync(dir, { recursive: true });
  return dir;
}
async function downloadRemoteOutput(filename, subfolder, type = "output") {
  const host = getBackendHost();
  const params = new URLSearchParams({
    filename,
    subfolder: subfolder || "",
    type,
  });
  const url = `${host}/view?${params.toString()}`;
  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(6e4) });
    if (!response.ok) return void 0;
    const buffer = Buffer.from(await response.arrayBuffer());
    const localDir = node_path.join(outputDir(), subfolder || "");
    node_fs.mkdirSync(localDir, { recursive: true });
    const localPath = node_path.join(localDir, filename);
    node_fs.writeFileSync(localPath, buffer);
    return localPath;
  } catch {
    return void 0;
  }
}
async function resolveOutputPath(filename, subfolder, type = "output") {
  if (isRemoteMode()) {
    return downloadRemoteOutput(filename, subfolder, type);
  }
  // 优先输出目录；Preview 类（type=temp）文件在引擎临时目录或 ComfyUI 安装目录 temp/ 下，
  // 按序探测（含外部 ComfyUI 安装目录），保证音频预览也能落地。
  const candidates = [node_path.join(outputDir(), subfolder || "", filename)];
  if (type === "temp" || String(subfolder || "").toLowerCase() === "temp") {
    if (activeEngineDir) candidates.push(node_path.join(activeEngineDir, "temp", filename));
    const settings = getWorkspaceSettings();
    if (settings.comfyuiDir) candidates.push(node_path.join(settings.comfyuiDir, "temp", filename));
    candidates.push(node_path.join(outputDir(), "temp", filename));
  }
  for (const candidate of candidates) {
    if (node_fs.existsSync(candidate)) {
      // 临时目录文件复制到输出目录，避免渲染器关闭引擎后文件丢失
      if (!candidate.startsWith(outputDir())) {
        try {
          node_fs.mkdirSync(node_path.join(outputDir(), subfolder || ""), { recursive: true });
          const target = node_path.join(outputDir(), subfolder || "", filename);
          node_fs.copyFileSync(candidate, target);
          return target;
        } catch {
          return candidate;
        }
      }
      return candidate;
    }
  }
  return void 0;
}
let remoteModelFiles = null;
function setRemoteModelFiles(files) {
  remoteModelFiles = files;
}
async function fetchRemoteModelFiles() {
  const host = getBackendHost();
  const folders = [
    "checkpoints",
    "vae",
    "loras",
    "text_encoders",
    "clip",
    "diffusion_models",
    "unet",
  ];
  const allNames = /* @__PURE__ */ new Set();
  for (const folder of folders) {
    try {
      const response = await fetch(`${host}/models/${folder}`, {
        signal: AbortSignal.timeout(3e3),
      });
      if (response.ok) {
        const names = await response.json();
        for (const name of names) {
          if (name.toLowerCase().endsWith(".safetensors")) {
            allNames.add(name);
            const base2 = node_path.basename(name);
            if (base2 !== name) allNames.add(base2);
          }
        }
      }
    } catch {}
  }
  return Array.from(allNames).map((name) => ({ name, path: name, size: 0 }));
}
function getFiles() {
  if (isRemoteMode() && remoteModelFiles) {
    return remoteModelFiles;
  }
  const dirs = [...categoryDirs("video"), ...categoryDirs("image")];
  const dedupDirs = [...new Set(dirs)];
  const root = defaultModelsDir();
  return scanSafetensors(dedupDirs).map((f) => ({
    // ComfyUI 以 models 根目录注册名称；必须保留 "video models\\" 等子目录前缀，
    // 否则 /prompt 会报 value_not_in_list / Prompt outputs failed validation。
    name: node_path.relative(root, f.path),
    path: f.path,
    size: f.size,
  }));
}
function isTtsModelDir(dir) {
  return (
    node_fs.existsSync(node_path.join(dir, "config.json")) &&
    node_fs.existsSync(node_path.join(dir, "model.safetensors"))
  );
}
function getTtsModelDirs() {
  const result2 = [];
  const seen = /* @__PURE__ */ new Set();
  const add = (name, full) => {
    if (seen.has(name)) return;
    seen.add(name);
    result2.push({ name, path: full });
  };
  for (const baseDir of categoryDirs("audio")) {
    if (!node_fs.existsSync(baseDir)) continue;
    let entries;
    try {
      entries = node_fs.readdirSync(baseDir, { withFileTypes: true });
    } catch {
      continue;
    }
    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      const full = node_path.join(baseDir, entry.name);
      if (isTtsModelDir(full)) {
        add(entry.name, full);
        continue;
      }
      try {
        for (const sub of node_fs.readdirSync(full, { withFileTypes: true })) {
          if (!sub.isDirectory()) continue;
          const subFull = node_path.join(full, sub.name);
          if (isTtsModelDir(subFull)) add(sub.name, subFull);
        }
      } catch {}
    }
  }
  return result2;
}
function modelChecks() {
  const files = getFiles();
  const specs = [
    // Ref2VA 与 FL2VA 是二选一底模；具体任务再校验用户选择的家族。
    {
      key: "diffusion",
      label: "H3 Ref2VA 主模型",
      pattern: /^minimax_h3_ref2va.*\.safetensors$/i,
      required: false,
    },
    {
      key: "textEncoder",
      label: "Qwen3-VL 文本编码器",
      pattern: /^qwen3vl_.*minimax_h3.*\.safetensors$/i,
      required: true,
    },
    {
      key: "videoVae",
      label: "视频 VAE",
      pattern: /^minimax_h3_video_vae.*\.safetensors$/i,
      required: true,
    },
    {
      key: "audioVae",
      label: "音频 VAE",
      pattern: /^minimax_h3_audio_vae.*\.safetensors$/i,
      required: true,
    },
    {
      key: "fl2va",
      label: "H3 FL2VA 文生/图生模型",
      pattern: /^minimax_h3_fl2va.*\.safetensors$/i,
      required: false,
    },
    {
      key: "kreaDiffusion",
      label: "Krea2 Turbo 主模型",
      pattern: /^krea2_turbo.*\.safetensors$/i,
      required: false,
    },
    {
      key: "kreaTextEncoder",
      label: "Krea2 Qwen3-VL 4B",
      pattern: /^qwen3vl_4b.*\.safetensors$/i,
      required: false,
    },
    {
      key: "kreaVae",
      label: "Krea2 图像 VAE",
      pattern: /^qwen_image_vae.*\.safetensors$/i,
      required: false,
    },
    {
      key: "zimageDiffusion",
      label: "Z-Image Turbo 主模型",
      pattern: /^(?:z_image_turbo|aixzimage).*\.safetensors$/i,
      required: false,
    },
    {
      key: "zimageTextEncoder",
      label: "Z-Image Qwen3 文本编码器",
      pattern: /^qwen_3_4b\.safetensors$/i,
      required: false,
    },
    {
      key: "zimageVae",
      label: "Z-Image VAE",
      pattern: /^ae\.(?:safetensors|sft)$/i,
      required: false,
    },
  ];
  const checks = specs.map((spec) => {
    const allMatches = files
      .filter((item) => spec.pattern.test(node_path.basename(item.name)))
      .filter(
        (item) =>
          !/minimax_h3.*(?:turbo|light.?tv|fast).*\d+\s*(?:step|步)/i.test(
            node_path.basename(item.name),
          ),
      );
    const file = allMatches[0];
    return {
      key: spec.key,
      label: spec.label,
      required: spec.required,
      found: Boolean(file),
      fileName: file?.name,
      sizeGb:
        file && file.size > 0
          ? Number((file.size / 1024 ** 3).toFixed(1))
          : void 0,
      allFiles: allMatches.map((f) => ({
        fileName: f.name,
        sizeGb: Number((f.size / 1024 ** 3).toFixed(1)),
      })),
    };
  });
  const ttsDirs = getTtsModelDirs();
  const ttsSpecs = [
    {
      key: "ttsVoiceDesign",
      label: "Qwen3-TTS 音色设计模型",
      match: /voicedesign|voice_design/i,
      required: false,
    },
  ];
  for (const ttsSpec of ttsSpecs) {
    const match = ttsDirs.find((d) => {
      let configText = "";
      try {
        configText = node_fs.readFileSync(
          node_path.join(d.path, "config.json"),
          "utf8",
        );
      } catch {}
      return ttsSpec.match.test(`${d.name} ${configText}`);
    });
    checks.push({
      key: ttsSpec.key,
      label: ttsSpec.label,
      required: ttsSpec.required,
      found: Boolean(match),
      fileName: match?.name,
      sizeGb: void 0,
    });
  }
  return checks;
}
function loraInfos() {
  const excluded = /^(minimax_h3_|qwen3vl_|qwen_image_vae|krea2_turbo)/i;
  if (isRemoteMode() && remoteModelFiles) {
    return remoteModelFiles
      .filter((file) => !excluded.test(node_path.basename(file.name)))
      .map((file) => ({
        fileName: file.name,
        label: file.name.replace(/\.safetensors$/i, "").replace(/[_-]+/g, " "),
        sizeMb: 0,
      }))
      .sort((a, b) => a.label.localeCompare(b.label, "zh-CN"));
  }
  const root = defaultModelsDir();
  const loraRoot = node_path.join(root, "loras");
  const files = scanSafetensors(
    node_fs.existsSync(loraRoot) ? [loraRoot] : categoryDirs("image"),
  );
  return files
    .filter(
      (file) =>
        !excluded.test(node_path.basename(file.name)) &&
        file.size < 2.5 * 1024 ** 3,
    )
    .map((file) => ({
      fileName: file.name,
      label: file.name.replace(/\.safetensors$/i, "").replace(/[_-]+/g, " "),
      sizeMb: Math.round(file.size / 1024 ** 2),
    }))
    .sort((a, b) => a.label.localeCompare(b.label, "zh-CN"));
}
function h3AccelerationLoraInfos() {
  const seen = /* @__PURE__ */ new Set();
  return getFiles()
    .filter((file) =>
      /minimax_h3.*(?:(?:turbo|light.?tv|fast).*(?:\d+\s*(?:step|步))|(?:\d+\s*(?:step|步)).*(?:turbo|light.?tv|fast)).*\.safetensors$/i.test(
        file.name,
      ),
    )
    .filter((file) => {
      const key = file.path.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .map((file) => ({
      fileName: file.name,
      label: node_path
        .basename(file.name)
        .replace(/\.safetensors$/i, "")
        .replace(/[_-]+/g, " "),
      sizeMb: Math.round(file.size / 1024 ** 2),
    }))
    .sort(
      (a, b) =>
        Number(/ema/i.test(a.fileName)) - Number(/ema/i.test(b.fileName)),
    );
}
function modelName(key, override) {
  if (override) {
    const files = getFiles();
    const found = files.find(
      (item2) =>
        item2.name === override ||
        node_path.basename(item2.name) === node_path.basename(override),
    );
    if (found) return found.name;
  }
  const item = modelChecks().find((check) => check.key === key);
  if (!item?.fileName) throw new Error(`缺少模型：${item?.label || key}`);
  return item.fileName;
}
function exactModelName(fileName, label) {
  const file = getFiles().find(
    (item) =>
      node_path.basename(item.name).toLowerCase() === fileName.toLowerCase(),
  );
  if (!file) throw new Error(`缺少${label}模型：${fileName}`);
  return file.name;
}
function frameLength(seconds) {
  const raw = Math.max(5, Math.round(seconds * 24));
  return raw + ((5 - (raw % 17) + 17) % 17);
}
function buildCanvasImageToolPrompt(request, uploadedImage) {
  const date = /* @__PURE__ */ new Date().toISOString().slice(0, 10);
  const load = {
    1: { class_type: "LoadImage", inputs: { image: uploadedImage } },
  };
  if (request.tool === "watermark") {
    return {
      ...load,
      2: {
        class_type: "UNETLoader",
        inputs: {
          unet_name: exactModelName(
            "flux1-dev-kontext_fp8_scaled.safetensors",
            "去水印 Flux Kontext",
          ),
          weight_dtype: "default",
        },
      },
      3: {
        class_type: "DualCLIPLoader",
        inputs: {
          clip_name1: exactModelName("clip_l.safetensors", "CLIP-L"),
          clip_name2: exactModelName(
            "t5xxl_fp8_e4m3fn_scaled.safetensors",
            "T5XXL",
          ),
          type: "flux",
          device: "default",
        },
      },
      4: {
        class_type: "VAELoader",
        inputs: { vae_name: exactModelName("ae.safetensors", "Flux VAE") },
      },
      5: { class_type: "FluxKontextImageScale", inputs: { image: ["1", 0] } },
      6: {
        class_type: "VAEEncode",
        inputs: { pixels: ["5", 0], vae: ["4", 0] },
      },
      7: {
        class_type: "CLIPTextEncode",
        inputs: {
          clip: ["3", 0],
          text: "Remove the watermarks and logos from the image while maintaining the color, color temperature, saturation, hue and gamma value of the image unchanged.",
        },
      },
      8: {
        class_type: "ReferenceLatent",
        inputs: { conditioning: ["7", 0], latent: ["6", 0] },
      },
      9: {
        class_type: "FluxGuidance",
        inputs: { conditioning: ["8", 0], guidance: 2.5 },
      },
      10: {
        class_type: "ConditioningZeroOut",
        inputs: { conditioning: ["7", 0] },
      },
      11: {
        class_type: "KSampler",
        inputs: {
          model: ["2", 0],
          positive: ["9", 0],
          negative: ["10", 0],
          latent_image: ["6", 0],
          seed: Math.floor(Math.random() * Number.MAX_SAFE_INTEGER),
          steps: 20,
          cfg: 1,
          sampler_name: "euler",
          scheduler: "simple",
          denoise: 1,
        },
      },
      12: {
        class_type: "VAEDecode",
        inputs: { samples: ["11", 0], vae: ["4", 0] },
      },
      13: {
        class_type: "SaveImage",
        inputs: {
          images: ["12", 0],
          filename_prefix: `Canvas/Watermark/${date}/Watermark`,
        },
      },
    };
  }
  if (request.tool === "cutout") {
    return {
      ...load,
      2: {
        class_type: "LoadBackgroundRemovalModel",
        inputs: {
          bg_removal_name: exactModelName(
            "birefnet.safetensors",
            "BiRefNet 抠图",
          ),
        },
      },
      3: {
        class_type: "RemoveBackground",
        inputs: { bg_removal_model: ["2", 0], image: ["1", 0] },
      },
      4: { class_type: "InvertMask", inputs: { mask: ["3", 0] } },
      5: {
        class_type: "JoinImageWithAlpha",
        inputs: { image: ["1", 0], alpha: ["4", 0] },
      },
      6: {
        class_type: "SaveImage",
        inputs: {
          images: ["5", 0],
          filename_prefix: `Canvas/Cutout/${date}/Cutout`,
        },
      },
    };
  }
  const resolution = request.resolution;
  const largestSize =
    resolution === "4k"
      ? 1920
      : resolution === "6k"
        ? 2880
        : resolution === "8k"
          ? 3840
          : 0;
  if (!resolution || !largestSize)
    throw new Error("高清功能请选择 4K、6K 或 8K");
  return {
    ...load,
    2: {
      class_type: "ImageScaleToMaxDimension",
      inputs: {
        image: ["1", 0],
        upscale_method: "lanczos",
        largest_size: largestSize,
      },
    },
    3: {
      class_type: "RTXVideoSuperResolution",
      inputs: {
        images: ["2", 0],
        resize_type: "scale by multiplier",
        "resize_type.scale": 2,
        quality: "ULTRA",
      },
    },
    4: {
      class_type: "AntiDetectAllInOne",
      inputs: {
        image: ["3", 0],
        处理强度: 0.35,
        预设风格: "自然",
        添加真实噪点: true,
        清除元数据: true,
        种子: -1,
      },
    },
    5: {
      class_type: "CleanSave",
      inputs: {
        image: ["4", 0],
        文件名前缀: `Canvas/Upscale-${resolution.toUpperCase()}/${date}/Upscale`,
        格式: "PNG",
        质量: 95,
      },
    },
  };
}
function buildPrompt(request, uploaded, seed, forceStable = false) {
  const isReference = request.videoMode === "reference";
  const isLongHighResolutionVideo =
    request.duration >= 12 && request.width * request.height >= 8e5;
  const h3ModelFamily = isReference
    ? request.h3ModelFamily || "ref2va"
    : "fl2va";
  const h3ModelKey = h3ModelFamily === "fl2va" ? "fl2va" : "diffusion";
  const ov = request.modelOverrides || {};
  const prompt = {
    1: {
      class_type: "UNETLoader",
      inputs: {
        unet_name: modelName(
          h3ModelKey,
          h3ModelKey === "fl2va" ? ov.fl2va : ov.diffusion,
        ),
        weight_dtype: "default",
      },
    },
    2: {
      class_type: "CLIPLoader",
      inputs: {
        clip_name: modelName("textEncoder", ov.textEncoder),
        type: "minimax",
        device: "default",
      },
    },
    3: {
      class_type: "VAELoader",
      inputs: { vae_name: modelName("videoVae", ov.videoVae) },
    },
    4: {
      class_type: "VAELoader",
      inputs: { vae_name: modelName("audioVae", ov.audioVae) },
    },
    20: isReference
      ? {
          class_type: "MiniMaxH3ReferenceToVideo",
          inputs: {
            clip: ["2", 0],
            vae: ["3", 0],
            audio_vae: ["4", 0],
            prompt: request.prompt,
            width: request.width,
            height: request.height,
            length: frameLength(request.duration),
            ref_image_size: request.refImageSize,
          },
        }
      : {
          class_type: "MiniMaxH3ImageToVideo",
          inputs: {
            clip: ["2", 0],
            vae: ["3", 0],
            prompt: request.prompt,
            width: request.width,
            height: request.height,
            length: frameLength(request.duration),
          },
        },
    30: { class_type: "RandomNoise", inputs: { noise_seed: seed } },
    31: { class_type: "KSamplerSelect", inputs: { sampler_name: "euler" } },
    32: {
      class_type: "BasicScheduler",
      inputs: {
        model: ["1", 0],
        scheduler: "beta",
        steps: Math.max(
          1,
          Math.min(50, Math.round(Number(request.steps) || 8)),
        ),
        denoise: 1,
      },
    },
    33: {
      class_type: "BasicGuider",
      inputs: { model: ["1", 0], conditioning: ["20", 0] },
    },
    34: {
      class_type: "SamplerCustomAdvanced",
      inputs: {
        noise: ["30", 0],
        guider: ["33", 0],
        sampler: ["31", 0],
        sigmas: ["32", 0],
        latent_image: ["20", 1],
      },
    },
    35: {
      class_type: "VAEDecode",
      inputs: { samples: ["34", 0], vae: ["3", 0] },
    },
    36: {
      class_type: "VAEDecodeAudio",
      inputs: { samples: ["34", 0], vae: ["4", 0] },
    },
    37: {
      class_type: "CreateVideo",
      inputs: { images: ["35", 0], fps: 24, audio: ["36", 0], bit_depth: 8 },
    },
    38: {
      class_type: "SaveVideo",
      inputs: {
        video: ["37", 0],
        filename_prefix: `MiniMax-H3/${/* @__PURE__ */ new Date().toISOString().slice(0, 10)}/H3`,
        format: "auto",
        codec: "auto",
      },
    },
  };
  const accelerationLoras = request.accelerationLoras?.length
    ? request.accelerationLoras
    : request.accelerationLora
      ? [request.accelerationLora]
      : [];
  if (accelerationLoras.length) {
    let modelLink = ["1", 0];
    accelerationLoras.forEach((lora, index) => {
      const id = String(5 + index);
      prompt[id] = {
        class_type: "LoraLoaderModelOnly",
        inputs: {
          model: modelLink,
          lora_name: lora.fileName,
          strength_model: lora.strength,
        },
      };
      modelLink = [id, 0];
    });
    prompt["33"].inputs.model = modelLink;
    const vramMode = effectiveVramMode();
    if (
      getWorkspaceSettings().sageAttention &&
      !isLongHighResolutionVideo &&
      !forceStable &&
      vramMode !== "low8" &&
      vramMode !== "low12" &&
      vramMode !== "mid24"
    ) {
      const sageId = String(5 + accelerationLoras.length);
      prompt[sageId] = {
        class_type: "PathchSageAttentionKJ",
        inputs: {
          model: modelLink,
          sage_attention: "auto",
          allow_compile: false,
        },
      };
      prompt["33"].inputs.model = [sageId, 0];
    }
  }
  let nextId = 100;
  let imageIndex = 0;
  let videoIndex = 0;
  let audioIndex = 0;
  let keyframeIndex = 0;
  for (const reference of request.references) {
    const file = uploaded.get(reference.id);
    if (!file) continue;
    if (reference.kind === "image") {
      const id = String(nextId++);
      prompt[id] = { class_type: "LoadImage", inputs: { image: file } };
      if (isReference)
        prompt["20"].inputs[`ref_images.ref_image_${imageIndex++}`] = [id, 0];
      else if (
        (request.videoMode === "image" || request.videoMode === "img2video") &&
        keyframeIndex < 2
      ) {
        prompt["20"].inputs[
          keyframeIndex === 0 ? "first_frame" : "last_frame"
        ] = [id, 0];
        keyframeIndex += 1;
      }
    } else if (reference.kind === "video") {
      const loadId = String(nextId++);
      const partsId = String(nextId++);
      prompt[loadId] = { class_type: "LoadVideo", inputs: { file } };
      prompt[partsId] = {
        class_type: "GetVideoComponents",
        inputs: { video: [loadId, 0] },
      };
      prompt["20"].inputs[`ref_videos.ref_video_${videoIndex}`] = [partsId, 0];
      prompt["20"].inputs[`ref_video_audios.ref_video_audio_${videoIndex}`] = [
        partsId,
        1,
      ];
      audioIndex += 1;
      videoIndex += 1;
    } else {
      const id = String(nextId++);
      prompt[id] = { class_type: "LoadAudio", inputs: { audio: file } };
      prompt["20"].inputs[`ref_audios.ref_audio_${audioIndex++}`] = [id, 0];
    }
  }
  return prompt;
}
function kreaOutputSize(request) {
  const target =
    request.resolution === "4k" ? 4096 : request.resolution === "2k" ? 2560 : 0;
  if (!target) return [request.width, request.height];
  if (request.width >= request.height) {
    return [
      target,
      Math.max(
        64,
        Math.round((target * request.height) / request.width / 64) * 64,
      ),
    ];
  }
  return [
    Math.max(
      64,
      Math.round((target * request.width) / request.height / 64) * 64,
    ),
    target,
  ];
}
function buildImagePrompt(request, seed, uploaded) {
  const imageRef = (request.references || []).find(
    (item) => item.kind === "image",
  );
  const refFile = imageRef ? uploaded.get(imageRef.id) : void 0;
  if (request.imageEngine === "zimage") {
    return buildZImagePrompt(request, seed, refFile);
  }
  const highResolution =
    request.resolution === "2k" || request.resolution === "4k";
  const kreaMode = request.kreaMode || "txt2img";
  if (kreaMode === "edit" && refFile) {
    return buildEditPrompt(request, seed, refFile);
  }
  const denoise = typeof request.denoise === "number" ? request.denoise : 1;
  const prompt = {
    1: {
      class_type: "UNETLoader",
      inputs: {
        unet_name: modelName(
          "kreaDiffusion",
          request.modelOverrides?.kreaDiffusion,
        ),
        weight_dtype: "default",
      },
    },
    2: {
      class_type: "CLIPLoader",
      inputs: {
        clip_name: modelName(
          "kreaTextEncoder",
          request.modelOverrides?.kreaTextEncoder,
        ),
        type: "krea2",
        device: "default",
      },
    },
    3: {
      class_type: "VAELoader",
      inputs: {
        vae_name: modelName("kreaVae", request.modelOverrides?.kreaVae),
      },
    },
    4: {
      class_type: "CLIPTextEncode",
      inputs: { clip: ["2", 0], text: request.prompt },
    },
    5: {
      class_type: "ConditioningZeroOut",
      inputs: { conditioning: ["4", 0] },
    },
    6: refFile
      ? { class_type: "LoadImage", inputs: { image: refFile } }
      : {
          class_type: "EmptyLatentImage",
          inputs: {
            width: request.width,
            height: request.height,
            batch_size: 1,
          },
        },
    8: {
      class_type: "VAEDecode",
      inputs: { samples: ["7", 0], vae: ["3", 0] },
    },
    9: {
      class_type: "SaveImage",
      inputs: {
        images: highResolution ? ["13", 0] : ["8", 0],
        filename_prefix: `Krea2/${/* @__PURE__ */ new Date().toISOString().slice(0, 10)}/Krea2`,
      },
    },
  };
  let modelLink = ["1", 0];
  request.loras.forEach((lora, index) => {
    const nodeId = String(20 + index);
    prompt[nodeId] = {
      class_type: "LoraLoaderModelOnly",
      inputs: {
        model: modelLink,
        lora_name: lora.fileName,
        strength_model: lora.strength,
      },
    };
    modelLink = [nodeId, 0];
  });
  let latentLink = ["6", 0];
  if (refFile) {
    prompt["14"] = {
      class_type: "VAEEncode",
      inputs: { pixels: ["6", 0], vae: ["3", 0] },
    };
    latentLink = ["14", 0];
  }
  prompt["7"] = {
    class_type: "KSampler",
    inputs: {
      model: modelLink,
      positive: ["4", 0],
      negative: ["5", 0],
      latent_image: latentLink,
      seed,
      steps: 8,
      cfg: 1,
      sampler_name: "euler_ancestral",
      scheduler: "sgm_uniform",
      denoise,
    },
  };
  if (highResolution) {
    const [width, height] = kreaOutputSize(request);
    prompt["10"] = {
      class_type: "ImageScale",
      inputs: {
        image: ["8", 0],
        upscale_method: "lanczos",
        width,
        height,
        crop: "disabled",
      },
    };
    prompt["11"] = {
      class_type: "VAEEncode",
      inputs: { pixels: ["10", 0], vae: ["3", 0] },
    };
    prompt["12"] = {
      class_type: "KSampler",
      inputs: {
        model: modelLink,
        positive: ["4", 0],
        negative: ["5", 0],
        latent_image: ["11", 0],
        seed,
        steps: 3,
        cfg: 1,
        sampler_name: "euler_ancestral",
        scheduler: "simple",
        denoise: 0.3,
      },
    };
    prompt["13"] = {
      class_type: "VAEDecode",
      inputs: { samples: ["12", 0], vae: ["3", 0] },
    };
  }
  return prompt;
}
function buildZImagePrompt(request, seed, refFile) {
  const denoise = typeof request.denoise === "number" ? request.denoise : 1;
  const prompt = {
    1: {
      class_type: "UNETLoader",
      inputs: {
        unet_name: modelName(
          "zimageDiffusion",
          request.modelOverrides?.zimageDiffusion,
        ),
        weight_dtype: "default",
      },
    },
    2: {
      class_type: "CLIPLoader",
      inputs: {
        clip_name: modelName(
          "zimageTextEncoder",
          request.modelOverrides?.zimageTextEncoder,
        ),
        type: "lumina2",
        device: "default",
      },
    },
    3: {
      class_type: "VAELoader",
      inputs: {
        vae_name: modelName("zimageVae", request.modelOverrides?.zimageVae),
      },
    },
    4: {
      class_type: "CLIPTextEncode",
      inputs: { clip: ["2", 0], text: request.prompt },
    },
    5: {
      class_type: "ConditioningZeroOut",
      inputs: { conditioning: ["4", 0] },
    },
    6: refFile
      ? { class_type: "LoadImage", inputs: { image: refFile } }
      : {
          class_type: "EmptySD3LatentImage",
          inputs: {
            width: request.width,
            height: request.height,
            batch_size: 1,
          },
        },
    7: {
      class_type: "KSampler",
      inputs: {
        model: ["11", 0],
        positive: ["4", 0],
        negative: ["5", 0],
        latent_image: ["6", 0],
        seed,
        steps: request.steps || 8,
        cfg: 1,
        sampler_name: "res_multistep",
        scheduler: "simple",
        denoise,
      },
    },
    8: {
      class_type: "VAEDecode",
      inputs: { samples: ["7", 0], vae: ["3", 0] },
    },
    9: {
      class_type: "SaveImage",
      inputs: {
        images: ["8", 0],
        filename_prefix: `ZImage/${/* @__PURE__ */ new Date().toISOString().slice(0, 10)}/ZImage`,
      },
    },
    11: {
      class_type: "ModelSamplingAuraFlow",
      inputs: { model: ["1", 0], shift: 3 },
    },
  };
  if (refFile) {
    prompt["14"] = {
      class_type: "VAEEncode",
      inputs: { pixels: ["6", 0], vae: ["3", 0] },
    };
    prompt["7"].inputs.latent_image = ["14", 0];
  }
  let modelLink = ["11", 0];
  request.loras.forEach((lora, index) => {
    const id = String(20 + index);
    prompt[id] = {
      class_type: "LoraLoaderModelOnly",
      inputs: {
        model: modelLink,
        lora_name: lora.fileName,
        strength_model: lora.strength,
      },
    };
    modelLink = [id, 0];
  });
  prompt["7"].inputs.model = modelLink;
  return prompt;
}
function buildEditPrompt(request, seed, refFile) {
  const prompt = {
    // 模型加载
    1: {
      class_type: "UNETLoader",
      inputs: {
        unet_name: modelName(
          "kreaDiffusion",
          request.modelOverrides?.kreaDiffusion,
        ),
        weight_dtype: "default",
      },
    },
    2: {
      class_type: "CLIPLoader",
      inputs: {
        clip_name: modelName(
          "kreaTextEncoder",
          request.modelOverrides?.kreaTextEncoder,
        ),
        type: "krea2",
        device: "default",
      },
    },
    3: {
      class_type: "VAELoader",
      inputs: {
        vae_name: modelName("kreaVae", request.modelOverrides?.kreaVae),
      },
    },
    // Krea2OstrisEdit 模型补丁（编辑核心）
    33: {
      class_type: "Krea2OstrisEditModelPatch",
      inputs: { model: ["1", 0] },
    },
    // 加载输入图片
    80: { class_type: "LoadImage", inputs: { image: refFile } },
    // 用原图 VAE 编码作为 latent（保持原图尺寸和比例，避免裁剪）
    6: {
      class_type: "VAEEncode",
      inputs: { pixels: ["80", 0], vae: ["3", 0] },
    },
  };
  prompt["34"] = {
    class_type: "TextEncodeKrea2OstrisEdit",
    inputs: {
      clip: ["2", 0],
      vae: ["3", 0],
      image1: ["80", 0],
      prompt: request.prompt,
    },
  };
  prompt["21"] = {
    class_type: "FluxKontextMultiReferenceLatentMethod",
    inputs: {
      conditioning: ["34", 0],
      reference_latents_method: "index_timestep_zero",
    },
  };
  prompt["35"] = {
    class_type: "TextEncodeKrea2OstrisEdit",
    inputs: {
      clip: ["2", 0],
      vae: ["3", 0],
      image1: ["80", 0],
      prompt: "",
    },
  };
  prompt["24"] = {
    class_type: "FluxKontextMultiReferenceLatentMethod",
    inputs: {
      conditioning: ["35", 0],
      reference_latents_method: "index_timestep_zero",
    },
  };
  let modelLink = ["33", 0];
  request.loras.forEach((lora, index) => {
    const nodeId = String(100 + index);
    prompt[nodeId] = {
      class_type: "LoraLoaderModelOnly",
      inputs: {
        model: modelLink,
        lora_name: lora.fileName,
        strength_model: lora.strength,
      },
    };
    modelLink = [nodeId, 0];
  });
  prompt["7"] = {
    class_type: "KSampler",
    inputs: {
      model: modelLink,
      positive: ["21", 0],
      negative: ["24", 0],
      latent_image: ["6", 0],
      seed,
      steps: 15,
      cfg: 1,
      sampler_name: "euler",
      scheduler: "beta",
      denoise: 1,
    },
  };
  prompt["8"] = {
    class_type: "VAEDecode",
    inputs: { samples: ["7", 0], vae: ["3", 0] },
  };
  prompt["9"] = {
    class_type: "SaveImage",
    inputs: {
      images: ["8", 0],
      filename_prefix: `Krea2/${/* @__PURE__ */ new Date().toISOString().slice(0, 10)}/Krea2Edit`,
    },
  };
  return prompt;
}
async function replaceFile(target, temporary) {
  try {
    await promises.rename(temporary, target);
  } catch {
    await promises.copyFile(temporary, target);
    await promises.rm(temporary, { force: true });
  }
}
async function writeJsonAtomically(target, json2, keepBackup = false) {
  const temporary = `${target}.tmp`;
  await promises.mkdir(node_path.dirname(target), { recursive: true });
  await promises.writeFile(temporary, json2, "utf8");
  if (keepBackup) {
    await promises.copyFile(target, `${target}.bak`).catch(() => void 0);
  }
  try {
    await replaceFile(target, temporary);
  } finally {
    await promises.rm(temporary, { force: true }).catch(() => void 0);
  }
}
class DebouncedJsonStore {
  timer;
  pendingJson;
  writeChain = Promise.resolve();
  target;
  delayMs;
  writer;
  onError;
  constructor(
    target,
    delayMs = 250,
    writer = (path, json2) => writeJsonAtomically(path, json2),
    onError = (error) => console.error("[persistence] JSON 写入失败", error),
  ) {
    this.target = target;
    this.delayMs = delayMs;
    this.writer = writer;
    this.onError = onError;
  }
  schedule(json2) {
    this.pendingJson = json2;
    if (this.timer) clearTimeout(this.timer);
    this.timer = setTimeout(() => {
      this.timer = void 0;
      this.enqueuePending();
    }, this.delayMs);
  }
  async flush() {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = void 0;
    }
    this.enqueuePending();
    await this.writeChain;
    if (this.pendingJson !== void 0) await this.flush();
  }
  enqueuePending() {
    if (this.pendingJson === void 0) return;
    const json2 = this.pendingJson;
    this.pendingJson = void 0;
    this.writeChain = this.writeChain
      .then(() => this.writer(this.target, json2))
      .catch(this.onError);
  }
}
function restorePersistedTask(task) {
  if (task.status !== "queued" && task.status !== "running") return task;
  return {
    ...task,
    error: "检测到上次未结束的任务，等待连接真实队列并恢复…",
  };
}
function providerPromptId(task) {
  if (task.backendPromptId) return task.backendPromptId;
  return task.kind === "image" ? task.id : void 0;
}
function publicGenerationTask(task) {
  const {
    recoveryGraph: _graph,
    recoveryAttempts: _attempts,
    ...publicTask
  } = task;
  return publicTask;
}
const tasks = /* @__PURE__ */ new Map();
const pendingSubmissions = /* @__PURE__ */ new Map();
let tasksLoaded = false;
let taskHistoryStore;
function getTaskHistoryStore() {
  taskHistoryStore ??= new DebouncedJsonStore(
    node_path.join(electron.app.getPath("userData"), "generation-history.json"),
    250,
  );
  return taskHistoryStore;
}
function ensureTasksLoaded() {
  if (tasksLoaded) return;
  tasksLoaded = true;
  try {
    const stored = JSON.parse(
      node_fs.readFileSync(
        node_path.join(
          electron.app.getPath("userData"),
          "generation-history.json",
        ),
        "utf8",
      ),
    );
    for (const item of stored) {
      const restored = restorePersistedTask(item);
      if (!restored.outputPath || node_fs.existsSync(restored.outputPath))
        tasks.set(restored.id, restored);
    }
    pushGenerationRecords();
  } catch {}
}
function persistTasks() {
  const history = [...tasks.values()]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 200);
  const keep = new Set(history.map((task) => task.id));
  for (const [id, task] of tasks) {
    if (keep.has(id)) continue;
    if (task.status === "queued" || task.status === "running") continue;
    tasks.delete(id);
  }
  getTaskHistoryStore().schedule(JSON.stringify(history, null, 2));
  pushGenerationRecords();
}
async function flushTaskPersistence() {
  await taskHistoryStore?.flush();
}

// --- 生成记录 (generation provenance → Serpent 资源管理) ----------------------
// 以「输出文件绝对路径 → 记录」组织：提示词/工作流/参数/模型/耗时等。
// 任务历史（generation-history.json）已含全部成功任务，可随时重建记录；
// 云端任务不经任务表，结果单独持久化到 generation-cloud-records.json。
let cloudGenRecordStore;
function getCloudGenRecordStore() {
  cloudGenRecordStore ??= new DebouncedJsonStore(
    node_path.join(electron.app.getPath("userData"), "generation-cloud-records.json"),
    250,
  );
  return cloudGenRecordStore;
}
function loadCloudGenerationRecords() {
  try {
    const parsed = JSON.parse(
      node_fs.readFileSync(
        node_path.join(
          electron.app.getPath("userData"),
          "generation-cloud-records.json",
        ),
        "utf8",
      ),
    );
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}
function generationModelLabel(task) {
  if (task.kind === "image") {
    if (task.imageEngine === "zimage") return "Z-Image Turbo";
    if (task.imageEngine === "krea2") return "Krea2";
    return task.imageEngine || null;
  }
  if (task.kind === "video") {
    if (task.providerId || task.model) return task.model || task.providerId || null;
    const family = task.h3ModelFamily;
    if (family === "ref2va") return "MiniMax H3 Ref2VA";
    if (family === "fl2va") return "MiniMax H3 FL2VA (视频)";
    return task.h3Model || null;
  }
  return task.model || task.providerModel || null;
}
function generationParamsFromTask(task) {
  const params = {};
  for (const key of [
    "width",
    "height",
    "duration",
    "seed",
    "resolution",
    "videoMode",
    "steps",
    "cfg",
    "sampler",
    "fps",
    "quality",
    "numFrames",
  ]) {
    if (task[key] !== void 0) params[key] = task[key];
  }
  if (task.loras && task.loras.length) params.loras = task.loras.join("、");
  if (task.accelerationLoras && task.accelerationLoras.length)
    params.accelerationLoras = task.accelerationLoras.join("、");
  return params;
}
// --- 生成记录「任务类型」：音频六大类型 + 图像/视频类型 --------------------
// 音频六类：语音生成 / 音色设计 / 音乐生成 / 音效生成 / 人声分离 / 语音转文本
// 图像：文生图 / 图生图 / 图编辑；视频：文生视频 / 首尾帧 / 图生视频 / 全能参考 / 视频编辑
const GENERATION_TASK_TYPE_LABELS = {
  voice: "语音生成",
  voiceDesign: "音色设计",
  music: "音乐生成",
  sfx: "音效生成",
  vocalSplit: "人声分离",
  asr: "语音转文本",
  txt2img: "文生图",
  img2img: "图生图",
  edit: "图编辑",
  text: "文生视频",
  firstlast: "首尾帧",
  image: "首尾帧",
  img2video: "图生视频",
  reference: "全能参考",
  videoEdit: "视频编辑",
};
function generationTaskTypeLabel(taskType) {
  return taskType ? GENERATION_TASK_TYPE_LABELS[taskType] || taskType : null;
}
// 工作流按 ComfyUI 目录结构归档时，可从路径第二段推断类型
const WORKFLOW_TASK_TYPES_BY_FOLDER = {
  语音生成: "voice",
  音色设计: "voiceDesign",
  文生音乐: "music",
  文生音效: "sfx",
  人声分离: "vocalSplit",
  语音转文本: "asr",
  文生图: "txt2img",
  图生图: "img2img",
  图编辑: "edit",
};
function inferTaskTypeFromWorkflowPath(path) {
  if (!path) return null;
  const normalized = String(path).replace(/\\/g, "/");
  const segments = normalized.split("/");
  const folder = segments[segments.length - 2] || "";
  if (WORKFLOW_TASK_TYPES_BY_FOLDER[folder]) return WORKFLOW_TASK_TYPES_BY_FOLDER[folder];
  const name = segments[segments.length - 1] || "";
  if (/音乐|music/i.test(name)) return "music";
  if (/音效|woosh|sound|sfx|拟声/i.test(name)) return "sfx";
  if (/人声|分离|vocal|stem|伴奏/i.test(name)) return "vocalSplit";
  if (/转文本|转文字|ASR|字幕|transcri|语音识别/i.test(name)) return "asr";
  if (/音色|voice.?design|声音设计/i.test(name)) return "voiceDesign";
  if (/语音|tts|voxcpm|qwen3|voice|克隆/i.test(name)) return "voice";
  if (/图生图|img2img/i.test(name)) return "img2img";
  if (/图编辑|编辑/i.test(name)) return "edit";
  if (/文生图|txt2img/i.test(name)) return "txt2img";
  return null;
}
// 任务的「任务类型」：显式 taskType 优先，其次按类别 / 模式推断。
function generationTaskType(task) {
  if (typeof task.taskType === "string" && task.taskType.trim()) return task.taskType;
  if (task.kind === "image") return task.kreaMode || "txt2img";
  if (task.kind === "video") {
    if (task.videoMode === "image") return "firstlast";
    return task.videoMode || "text";
  }
  if (task.kind === "audio") return task.audioMode || "voice";
  if (task.kind === "custom-workflow")
    return inferTaskTypeFromWorkflowPath(task.workflowPath || task.workflowName);
  return null;
}
function toGenerationRecord(task) {
  const started = task.createdAt ? Date.parse(task.createdAt) : NaN;
  const finished = task.updatedAt ? Date.parse(task.updatedAt) : NaN;
  const params = generationParamsFromTask(task);
  const taskType = generationTaskType(task);
  const record = {
    taskId: task.id || null,
    kind: task.kind || null,
    taskType: taskType || null,
    taskTypeLabel: taskType ? generationTaskTypeLabel(taskType) : null,
    prompt: task.prompt || null,
    workflow: task.workflowName || null,
    model: generationModelLabel(task),
    params: Object.keys(params).length ? params : null,
    durationMs:
      Number.isFinite(started) && Number.isFinite(finished)
        ? Math.max(0, finished - started)
        : null,
    createdAt: task.createdAt || null,
    completedAt: task.updatedAt || null,
    engine: task.providerId || task.providerModel ? "云端中转" : task.kind ? "本地引擎" : null,
  };
  return record;
}
function recordCloudGeneration(result, kind, taskType) {
  if (!result) return;
  const paths = Array.isArray(result.outputPaths)
    ? result.outputPaths
    : result.outputPath
      ? [result.outputPath]
      : [];
  if (!paths.length) return;
  const resolvedTaskType = taskType || result.taskType || null;
  const record = {
    taskId: result.id || null,
    kind: kind || null,
    taskType: resolvedTaskType,
    taskTypeLabel: resolvedTaskType ? generationTaskTypeLabel(resolvedTaskType) : null,
    prompt: result.prompt || null,
    workflow: result.workflowName || null,
    model: result.model || result.providerModel || null,
    params: null,
    durationMs: typeof result.elapsedMs === "number" ? result.elapsedMs : null,
    createdAt: result.createdAt || /* @__PURE__ */ new Date().toISOString(),
    completedAt: /* @__PURE__ */ new Date().toISOString(),
    engine: result.providerId ? "云端中转" : "云端",
  };
  const store = loadCloudGenerationRecords();
  for (const p of paths) store[node_path.resolve(p)] = record;
  getCloudGenRecordStore().schedule(JSON.stringify(store, null, 2));
  pushGenerationRecords();
}
function buildGenerationRecords() {
  try {
    ensureTasksLoaded();
  } catch {}
  const records = {};
  for (const task of tasks.values()) {
    if (task.status !== "succeeded") continue;
    const paths = task.outputPaths && task.outputPaths.length
      ? task.outputPaths
      : task.outputPath
        ? [task.outputPath]
        : [];
    if (!paths.length) continue;
    const record = toGenerationRecord(task);
    for (const p of paths) records[node_path.resolve(p)] = record;
  }
  const cloud = loadCloudGenerationRecords();
  for (const [p, record] of Object.entries(cloud)) {
    if (!records[p]) records[p] = record;
  }
  return records;
}
function pushGenerationRecords() {
  try {
    if (serpentHost && typeof serpentHost.setGeneratedAssetsRecords === "function") {
      serpentHost.setGeneratedAssetsRecords(buildGenerationRecords());
    }
  } catch {}
}
function updateTask(id, update) {
  ensureTasksLoaded();
  const current = tasks.get(id);
  if (!current) throw new Error("任务不存在");
  const next = {
    ...current,
    ...update,
    updatedAt: /* @__PURE__ */ new Date().toISOString(),
  };
  tasks.set(id, next);
  persistTasks();
  return publicGenerationTask(next);
}
function listTasks() {
  ensureTasksLoaded();
  return [...tasks.values()]
    .map(publicGenerationTask)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}
let preparing = null;
const RUNTIME_MARKER = "yunhui-runtime-v8-cu130-py312-sage.ready";
const PYPI_MIRRORS = [
  "https://pypi.tuna.tsinghua.edu.cn/simple",
  "https://mirrors.aliyun.com/pypi/simple",
  "https://pypi.mirrors.ustc.edu.cn/simple",
  "https://pypi.org/simple",
];
const TORCH_SOURCES = [
  {
    label: "PyTorch cu130（清华镜像）",
    indexUrl: "https://mirrors.tuna.tsinghua.edu.cn/pytorch-wheels/cu130/",
    packages: ["torch==2.10.0", "torchvision==0.25.0", "torchaudio==2.10.0"],
  },
  {
    label: "PyTorch cu130（官方源）",
    indexUrl: "https://download.pytorch.org/whl/cu130",
    packages: ["torch==2.10.0", "torchvision==0.25.0", "torchaudio==2.10.0"],
  },
  {
    label: "PyTorch cu128（官方源回退）",
    indexUrl: "https://download.pytorch.org/whl/cu128",
    packages: ["torch==2.10.0", "torchvision==0.25.0", "torchaudio==2.10.0"],
  },
  {
    label: "PyTorch cu128（清华镜像回退）",
    indexUrl: "https://mirrors.tuna.tsinghua.edu.cn/pytorch-wheels/cu128/",
    packages: ["torch==2.10.0", "torchvision==0.25.0", "torchaudio==2.10.0"],
  },
];
function bundledResourcePath(...parts) {
  return electron.app.isPackaged
    ? node_path.join(process.resourcesPath, "bundled-resources", ...parts)
    : node_path.join(electron.app.getAppPath(), "bundled-resources", ...parts);
}
function engineRootCandidates() {
  return [
    node_path.join(process.resourcesPath, "engine"),
    bundledResourcePath("engine"),
    node_path.resolve(electron.app.getAppPath(), "engine"),
  ];
}
function configuredComfyuiCandidates() {
  const candidates = [];
  try {
    const settings = getWorkspaceSettings();
    if (settings.comfyuiDir?.trim()) candidates.push(settings.comfyuiDir.trim());
  } catch {}
  if (process.env.COMFYUI_PATH?.trim()) candidates.push(process.env.COMFYUI_PATH.trim());
  return candidates
    .map((directory) => node_path.resolve(directory))
    .filter((directory, index, list) => list.indexOf(directory) === index);
}
function engineCandidates() {
  return configuredComfyuiCandidates();
}
function toolCandidates() {
  return engineRootCandidates().map((root) =>
    node_path.join(root, "yunhui_tools"),
  );
}
function ttsEngineCandidates() {
  return [
    node_path.join(process.resourcesPath, "engine", "tts"),
    bundledResourcePath("engine", "tts"),
    node_path.resolve(electron.app.getAppPath(), "engine", "tts"),
  ];
}
function bundledPythonCandidates(engineDir) {
  return [
    node_path.join(process.resourcesPath, "python", "python.exe"),
    bundledResourcePath("python", "python.exe"),
    node_path.join(node_path.dirname(engineDir), "python", "python.exe"),
    node_path.join(
      electron.app.getPath("userData"),
      "runtime",
      "venv312",
      "Scripts",
      "python.exe",
    ),
  ];
}
function uvCandidates() {
  return [
    node_path.join(process.resourcesPath, "runtime-tools", "uv.exe"),
    bundledResourcePath("runtime-tools", "uv.exe"),
    node_path.resolve(electron.app.getAppPath(), "runtime-tools", "uv.exe"),
  ];
}
function uvPythonInstallMirror(env = process.env) {
  return (
    env.UV_PYTHON_INSTALL_MIRROR?.trim() ||
    "https://registry.npmmirror.com/-/binary/python-build-standalone"
  );
}
function run(executable, args, cwd, onLog) {
  return new Promise((resolvePromise, reject) => {
    const child = node_child_process.spawn(executable, args, {
      cwd,
      windowsHide: true,
      env: {
        ...process.env,
        PYTHONUTF8: "1",
        UV_CACHE_DIR: node_path.join(
          electron.app.getPath("userData"),
          "runtime",
          "cache",
        ),
        UV_PYTHON_INSTALL_DIR: node_path.join(
          electron.app.getPath("userData"),
          "runtime",
          "pythons",
        ),
        // Python 解释器默认从 GitHub (python-build-standalone) 下载，无代理网络基本必失败；
        // 切到国内镜像（用户已显式设置时尊重用户值）。
        UV_PYTHON_INSTALL_MIRROR: uvPythonInstallMirror(process.env),
        UV_LINK_MODE: "copy",
        UV_HTTP_TIMEOUT: "900",
        // 15 分钟超时
        PIP_DEFAULT_TIMEOUT: "900",
        PIP_RETRIES: "10",
      },
    });
    const emit2 = (chunk) => {
      const line = chunk.toString("utf8").trim();
      if (line) onLog?.(line);
    };
    child.stdout.on("data", emit2);
    child.stderr.on("data", emit2);
    child.once("error", reject);
    child.once("exit", (code) => {
      if (code === 0) resolvePromise();
      else reject(new Error(`命令退出码 ${code ?? "未知"}`));
    });
  });
}
async function installWithMirrors(
  uvPath2,
  pythonPath2,
  packages,
  mirrors,
  cwd,
  onLog,
  onPhase,
  label,
  maxRetriesPerMirror = 3,
) {
  let lastError2 = null;
  for (let mi = 0; mi < mirrors.length; mi += 1) {
    const mirror = mirrors[mi];
    for (let attempt = 1; attempt <= maxRetriesPerMirror; attempt += 1) {
      onPhase?.(
        `${label}（镜像${mi + 1}/${mirrors.length}${attempt > 1 ? `·重试${attempt}` : ""}）…`,
      );
      onLog?.(`>>> ${label} | ${mirror}（第${attempt}次）`);
      try {
        await run(
          uvPath2,
          [
            "pip",
            "install",
            "--python",
            pythonPath2,
            ...packages,
            "--index-url",
            mirror,
          ],
          cwd,
          onLog,
        );
        onLog?.(`>>> ${label} 安装成功（${mirror}）`);
        return;
      } catch (err) {
        lastError2 = err instanceof Error ? err : new Error(String(err));
        onLog?.(
          `>>> ${label} 失败（镜像${mi + 1}·第${attempt}次）: ${lastError2.message}`,
        );
        if (attempt < maxRetriesPerMirror) {
          const waitSec = attempt * 10;
          onPhase?.(`${label} 失败，${waitSec}秒后重试…`);
          await new Promise((r) => setTimeout(r, waitSec * 1e3));
        }
      }
    }
    if (mi < mirrors.length - 1) {
      onPhase?.(`切换到下一个下载源…`);
      onLog?.(`>>> ${label}: 镜像 ${mirror} 不可用，尝试下一个`);
    }
  }
  onPhase?.(`${label}: 尝试用 pip 直接安装…`);
  const pipExe = node_path.join(node_path.dirname(pythonPath2), "pip.exe");
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    onLog?.(`>>> pip 降级安装（第${attempt}/3次）`);
    try {
      await run(
        pipExe,
        [
          "install",
          ...packages,
          "--index-url",
          mirrors[0],
          "--timeout",
          "900",
          "--retries",
          "10",
        ],
        cwd,
        onLog,
      );
      onLog?.(`>>> ${label} pip 安装成功`);
      return;
    } catch (err) {
      lastError2 = err instanceof Error ? err : new Error(String(err));
      onLog?.(`>>> pip 第${attempt}次失败: ${lastError2.message}`);
      if (attempt < 3) await new Promise((r) => setTimeout(r, 15e3));
    }
  }
  throw lastError2 || new Error(`${label} 所有安装方式均失败`);
}
async function installPytorch(uvPath2, pythonPath2, cwd, onLog, onPhase) {
  for (let si = 0; si < TORCH_SOURCES.length; si += 1) {
    const src = TORCH_SOURCES[si];
    const isLastSource = si === TORCH_SOURCES.length - 1;
    for (let attempt = 1; attempt <= 4; attempt += 1) {
      onPhase?.(`安装 ${src.label}${attempt > 1 ? `（第${attempt}次）` : ""}…`);
      onLog?.(
        `>>> PyTorch: ${src.indexUrl}（源${si + 1}/${TORCH_SOURCES.length}·第${attempt}/4次）`,
      );
      try {
        await run(
          uvPath2,
          [
            "pip",
            "install",
            "--python",
            pythonPath2,
            ...src.packages,
            "--index-url",
            src.indexUrl,
          ],
          cwd,
          onLog,
        );
        onLog?.(`>>> ${src.label} 安装成功`);
        return src.label;
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        onLog?.(`>>> ${src.label} 失败（第${attempt}次）: ${msg}`);
        if (attempt < 4) {
          const waitSec = attempt * 15;
          onPhase?.(`${src.label} 失败，${waitSec}秒后重试…`);
          await new Promise((r) => setTimeout(r, waitSec * 1e3));
        }
      }
    }
    if (!isLastSource) {
      onPhase?.(`${src.label} 不可用，切换下载源…`);
      onLog?.(`>>> PyTorch: ${src.label} 全部失败，尝试下一个源`);
    }
  }
  onPhase?.("尝试用 pip 直接安装 PyTorch…");
  const pipExe = node_path.join(node_path.dirname(pythonPath2), "pip.exe");
  for (const src of TORCH_SOURCES) {
    for (let attempt = 1; attempt <= 3; attempt += 1) {
      onLog?.(`>>> pip 降级: ${src.label}（第${attempt}/3次）`);
      try {
        await run(
          pipExe,
          [
            "install",
            ...src.packages,
            "--index-url",
            src.indexUrl,
            "--timeout",
            "900",
            "--retries",
            "10",
          ],
          cwd,
          onLog,
        );
        onLog?.(`>>> pip 安装 ${src.label} 成功`);
        return src.label + "（pip）";
      } catch (err) {
        onLog?.(
          `>>> pip ${src.label} 失败（第${attempt}次）: ${err instanceof Error ? err.message : err}`,
        );
        if (attempt < 3) await new Promise((r) => setTimeout(r, 2e4));
      }
    }
  }
  throw new Error(
    "PyTorch 安装失败：已尝试全部镜像和重试。\n请手动安装：\n1. 打开目录 %APPDATA%/韵绘/runtime/venv312/Scripts/\n2. 执行: pip install torch==2.10.0 torchvision==0.25.0 --index-url https://download.pytorch.org/whl/cu130\n3. 安装完成后重启软件",
  );
}
const SELF_CHECK_MODULES =
  "sys, torch, torchvision, aiohttp, yaml, PIL, av, transformers, safetensors, cv2, moviepy, scipy.integrate, scipy.sparse";
async function runtimeIsReady(pythonPath2, engineDir) {
  const marker = node_path.join(
    node_path.dirname(node_path.dirname(pythonPath2)),
    RUNTIME_MARKER,
  );
  if (!node_fs.existsSync(marker)) return false;
  try {
    await run(
      pythonPath2,
      [
        "-c",
        `import ${SELF_CHECK_MODULES}; assert sys.version_info[:2] == (3, 12); print(torch.__version__, torch.cuda.is_available(), scipy.__version__)`,
      ],
      engineDir,
    );
    return true;
  } catch {
    return false;
  }
}
function filteredRequirements(engineDir) {
  const reqPath = node_path.join(engineDir, "requirements.txt");
  if (!node_fs.existsSync(reqPath)) return "";
  const lines = node_fs.readFileSync(reqPath, "utf8").split("\n");
  const skip = ["torch", "torchvision", "torchaudio", "torchsde"];
  const filtered = lines.filter((line) => {
    const trimmed = line.trim().toLowerCase();
    return !skip.some((s) => trimmed === s || trimmed.startsWith(s + " "));
  });
  return filtered.join("\n");
}
async function prepare(engineDir, onLog, onPhase) {
  const uvPath2 = uvCandidates().find(node_fs.existsSync);
  if (!uvPath2)
    throw new Error("安装包缺少推理环境安装器 uv.exe，请重新安装韵绘");
  const runtimeRoot = node_path.join(
    electron.app.getPath("userData"),
    "runtime",
  );
  const venvDir2 = node_path.join(runtimeRoot, "venv312");
  const pythonPath2 = node_path.join(venvDir2, "Scripts", "python.exe");
  node_fs.mkdirSync(runtimeRoot, { recursive: true });
  if (!node_fs.existsSync(pythonPath2)) {
    let venvCreated = false;
    for (let attempt = 1; attempt <= 5 && !venvCreated; attempt += 1) {
      onPhase?.(
        `创建 Python 3.12 环境${attempt > 1 ? `（第${attempt}/5次）` : ""}…`,
      );
      try {
        await run(
          uvPath2,
          ["venv", venvDir2, "--python", "3.12"],
          runtimeRoot,
          onLog,
        );
        venvCreated = true;
      } catch (err) {
        onLog?.(
          `>>> 创建环境失败（第${attempt}次）: ${err instanceof Error ? err.message : err}`,
        );
        if (attempt < 5) {
          onPhase?.(`创建环境失败，${attempt * 10}秒后重试…`);
          await new Promise((r) => setTimeout(r, attempt * 1e4));
        }
      }
    }
    if (!venvCreated)
      throw new Error("Python 3.12 环境创建失败，请检查网络后重启软件重试");
  }
  const torchLabel = await installPytorch(
    uvPath2,
    pythonPath2,
    runtimeRoot,
    onLog,
    onPhase,
  );
  await installWithMirrors(
    uvPath2,
    pythonPath2,
    ["torchsde"],
    [...PYPI_MIRRORS.slice(0, 2), "https://download.pytorch.org/whl/cu130"],
    runtimeRoot,
    onLog,
    onPhase,
    "安装 torchsde",
    3,
  );
  const filteredReq = filteredRequirements(engineDir);
  if (filteredReq.trim()) {
    const tempReqPath = node_path.join(
      runtimeRoot,
      "requirements_filtered.txt",
    );
    node_fs.writeFileSync(tempReqPath, filteredReq, "utf8");
    let reqInstalled = false;
    for (let mi = 0; mi < PYPI_MIRRORS.length && !reqInstalled; mi += 1) {
      const mirror = PYPI_MIRRORS[mi];
      for (let attempt = 1; attempt <= 4 && !reqInstalled; attempt += 1) {
        onPhase?.(
          `安装生成组件（镜像${mi + 1}/${PYPI_MIRRORS.length}${attempt > 1 ? `·重试${attempt}` : ""}）…`,
        );
        try {
          await run(
            uvPath2,
            [
              "pip",
              "install",
              "--python",
              pythonPath2,
              "-r",
              tempReqPath,
              "--index-url",
              mirror,
            ],
            runtimeRoot,
            onLog,
          );
          reqInstalled = true;
        } catch (err) {
          onLog?.(
            `>>> 组件安装失败（镜像${mi + 1}·第${attempt}次）: ${err instanceof Error ? err.message : err}`,
          );
          if (attempt < 4) {
            onPhase?.(`安装失败，${attempt * 10}秒后重试…`);
            await new Promise((r) => setTimeout(r, attempt * 1e4));
          }
        }
      }
    }
    if (!reqInstalled)
      throw new Error("生成组件安装失败，请检查网络后重启软件重试");
  }
  await installWithMirrors(
    uvPath2,
    pythonPath2,
    ["--reinstall", "scipy>=1.14.1,<2"],
    PYPI_MIRRORS,
    runtimeRoot,
    onLog,
    onPhase,
    "修复 SciPy 科学计算组件",
    3,
  );
  await installWithMirrors(
    uvPath2,
    pythonPath2,
    ["--reinstall", "opencv-python-headless==4.10.0.84"],
    PYPI_MIRRORS,
    runtimeRoot,
    onLog,
    onPhase,
    "安装 OpenCV",
    3,
  );
  await installWithMirrors(
    uvPath2,
    pythonPath2,
    ["imageio-ffmpeg"],
    PYPI_MIRRORS,
    runtimeRoot,
    onLog,
    onPhase,
    "安装 FFmpeg 组件",
    3,
  );
  try {
    await installWithMirrors(
      uvPath2,
      pythonPath2,
      ["triton-windows"],
      PYPI_MIRRORS,
      runtimeRoot,
      onLog,
      onPhase,
      "安装 Triton (SageAttention 依赖)",
      2,
    );
    await installWithMirrors(
      // PyPI 包版本 1.0.6 提供 SageAttention 2 的 sageattn 接口；产品代际不是包版本号。
      uvPath2,
      pythonPath2,
      ["sageattention==1.0.6"],
      PYPI_MIRRORS,
      runtimeRoot,
      onLog,
      onPhase,
      "安装 SageAttention 2 加速",
      2,
    );
  } catch (err) {
    onLog?.(
      `>>> SageAttention 安装失败（可选组件，不影响使用）: ${err instanceof Error ? err.message : err}`,
    );
  }
  try {
    await run(
      pythonPath2,
      [
        "-c",
        'from sageattention import sageattn; import importlib.metadata as m; v=m.version("sageattention"); assert v == "1.0.6"; print("SAGE2_API_OK", v)',
      ],
      engineDir,
      onLog,
    );
    onLog?.(">>> SageAttention 2 验证通过（RTX 40 系兼容路径）");
  } catch {
    onLog?.(
      ">>> SageAttention 导入失败（CUDA 编译可能不匹配），加速功能将不可用，不影响正常使用",
    );
  }
  const ttsEngineDir = ttsEngineCandidates().find((d) =>
    node_fs.existsSync(node_path.join(d, "rest_server.py")),
  );
  if (ttsEngineDir) {
    onPhase?.("安装语音合成（Qwen3-TTS）组件…");
    try {
      await installWithMirrors(
        uvPath2,
        pythonPath2,
        ["transformers==4.57.3", "accelerate==1.12.0"],
        PYPI_MIRRORS,
        runtimeRoot,
        onLog,
        onPhase,
        "安装 TTS transformers",
        3,
      );
      await installWithMirrors(
        uvPath2,
        pythonPath2,
        ["flask", "flask-cors"],
        PYPI_MIRRORS,
        runtimeRoot,
        onLog,
        onPhase,
        "安装 TTS Web 服务组件",
        3,
      );
      await installWithMirrors(
        uvPath2,
        pythonPath2,
        ["librosa>=0.10.0", "soundfile>=0.12.0", "einops>=0.7.0"],
        PYPI_MIRRORS,
        runtimeRoot,
        onLog,
        onPhase,
        "安装 TTS 音频处理组件",
        3,
      );
      try {
        await run(
          pythonPath2,
          [
            "-c",
            'import flask, librosa, soundfile, einops, transformers; print("TTS_DEPS_OK")',
          ],
          ttsEngineDir,
          onLog,
        );
        onLog?.(">>> Qwen3-TTS 依赖验证通过");
      } catch (err) {
        onLog?.(
          `>>> Qwen3-TTS 依赖验证失败（语音功能将不可用）: ${err instanceof Error ? err.message : err}`,
        );
      }
    } catch (err) {
      onLog?.(
        `>>> Qwen3-TTS 组件安装失败（可选，不影响视频/图片生成）: ${err instanceof Error ? err.message : err}`,
      );
    }
  } else {
    onLog?.(">>> 未找到内置 Qwen3-TTS 引擎目录，跳过语音组件安装");
  }
  onPhase?.("验证安装环境…");
  await run(
    pythonPath2,
    [
      "-c",
      `import ${SELF_CHECK_MODULES}; assert sys.version_info[:2] == (3, 12); assert hasattr(cv2, "CascadeClassifier"); print("YUNHUI_RUNTIME_OK", torch.__version__, scipy.__version__)`,
    ],
    engineDir,
    onLog,
  );
  node_fs.writeFileSync(
    node_path.join(venvDir2, RUNTIME_MARKER),
    /* @__PURE__ */ new Date().toISOString(),
    "utf8",
  );
  onPhase?.(`${torchLabel} 环境就绪`);
  return {
    engineDir,
    ttsEngineDir: ttsEngineDir || "",
    pythonPath: pythonPath2,
  };
}
async function resolveRuntime(onLog, onPhase) {
  const engineDir = engineCandidates().find(
    (directory) =>
      node_fs.existsSync(node_path.join(directory, "main.py")) &&
      node_fs.existsSync(
        node_path.join(directory, "comfy_extras", "nodes_minimax_h3.py"),
      ),
  );
  if (!engineDir)
    throw new Error("未找到可用的外部 ComfyUI，请在工作区里选择安装目录，或设置 COMFYUI_PATH");
  const toolDir = toolCandidates().find((directory) =>
    node_fs.existsSync(node_path.join(directory, "face_mosaic.py")),
  );
  if (!toolDir) throw new Error("安装包中的工具脚本不完整，请重新安装韵绘");
  const ttsEngineDir =
    ttsEngineCandidates().find((d) =>
      node_fs.existsSync(node_path.join(d, "rest_server.py")),
    ) || "";
  const existingPython = bundledPythonCandidates(engineDir).find(
    node_fs.existsSync,
  );
  if (existingPython && (await runtimeIsReady(existingPython, engineDir))) {
    return { engineDir, toolDir, ttsEngineDir, pythonPath: existingPython };
  }
  if (!preparing)
    preparing = prepare(engineDir, onLog, onPhase).finally(() => {
      preparing = null;
    });
  const runtime = await preparing;
  return { ...runtime, toolDir };
}
const execFileAsync$2 = node_util.promisify(node_child_process.execFile);
let backendProcess = null;
let backendState = "offline";
let backendStopping = false;
let backendMessage = "等待启动本地引擎";
let backendLogTail = [];
let activeEngineDir = "";
let activeToolDir = "";
let activeTtsEngineDir = "";
let activePythonPath = "";
let activeLocalMode = null;
let modeTransition = Promise.resolve();
let requestedLongVideoSafetyMode = false;
let activeLongVideoSafetyMode = false;
let requestedLongVideoPytorchBase = false;
let activeLongVideoPytorchBase = false;
let forceStableH3Mode = false;
let backendRestartPromise = null;
let autoRestartTimer = null;
function getEngineModeFlags() {
  return {
    activeLongVideoSafetyMode,
    activeLongVideoPytorchBase,
    forceStableH3Mode,
  };
}
function requestLongVideoModes(safetyMode, pytorchBase) {
  requestedLongVideoSafetyMode = safetyMode;
  requestedLongVideoPytorchBase = pytorchBase;
}
function setBackendMessage(message2) {
  backendMessage = message2;
}
function isEngineProcessAlive() {
  return Boolean(backendProcess && !backendProcess.killed);
}
function getEngineStateValue() {
  return backendState;
}
function getActiveLocalMode() {
  return activeLocalMode;
}
function setActiveLocalMode(mode) {
  activeLocalMode = mode;
}
function enqueueModeTransition(job) {
  modeTransition = modeTransition.then(job);
  return modeTransition;
}
function writeBackendCrashLog(code, lines) {
  const logDir = node_path.join(electron.app.getPath("userData"), "logs");
  const logPath = node_path.join(logDir, "h3-engine-crash.log");
  try {
    node_fs.mkdirSync(logDir, { recursive: true });
    node_fs.appendFileSync(
      logPath,
      `
===== ${/* @__PURE__ */ new Date().toISOString()} exit=${code ?? "unknown"} =====
${lines.join("\n")}
`,
      "utf8",
    );
  } catch {}
  return logPath;
}
function backendCrashDiagnostic(lines) {
  const fatalPatterns =
    /fatal python error|access violation|out of memory|cuda error|illegal memory|device-side assert|triton|sage|exception|traceback|failed|scipy|numpy|dll load failed|multiarray|_array_api|module not found/i;
  return (
    [...lines]
      .reverse()
      .find(
        (line) =>
          fatalPatterns.test(line) &&
          !/^\s*[\w.]+(?:,\s*[\w.]+)+\s*\(total:/i.test(line),
      ) || ""
  );
}
function scheduleAutoRestart(onLog) {
  if (autoRestartTimer) clearTimeout(autoRestartTimer);
  autoRestartTimer = setTimeout(() => {
    autoRestartTimer = null;
    restartBackend(onLog)
      .then(() => onLog?.("[auto-restart] 引擎已自动重启"))
      .catch((err) =>
        onLog?.(
          `[auto-restart] 自动重启失败：${err instanceof Error ? err.message : String(err)}`,
        ),
      );
  }, 3e3);
}
async function probeGpuRuntime(pythonPath2, engineDir) {
  const script = [
    "import sys, torch",
    "if not torch.cuda.is_available():",
    "    print('NO_CUDA'); sys.exit(2)",
    "cap = torch.cuda.get_device_capability(0)",
    "print('GPU_OK|' + torch.cuda.get_device_name(0) + '|sm_%d%d' % cap)",
    "sys.exit(0 if (cap[0] > 7 or (cap[0] == 7 and cap[1] >= 5)) else 3)",
  ].join("\n");
  let stdout = "";
  let code;
  try {
    const result2 = await execFileAsync$2(pythonPath2, ["-c", script], {
      cwd: engineDir,
      windowsHide: true,
      encoding: "utf8",
      timeout: 12e4,
    });
    stdout = result2.stdout || "";
  } catch (error) {
    stdout = String(error.stdout || "");
    code = error.code;
  }
  const text = stdout.trim();
  if (/NO_CUDA/.test(text)) return { state: "no-cuda", detail: text };
  if (/\bGPU_OK\b/.test(text)) {
    const sm = /sm_(\d+)/.exec(text)?.[1] || "";
    if (code === 3 || (sm && Number(sm) < 75))
      return { state: "unsupported", detail: text };
    return { state: "ok", detail: text };
  }
  return {
    state: "broken",
    detail: `exit=${code ?? "未知"} ${text.slice(0, 200)}`,
  };
}
function runtimeRecoveryHint() {
  return `退出韵绘后删除文件夹 "${node_path.join(electron.app.getPath("userData"), "runtime")}"，再启动软件会自动重装运行时（走国内镜像，无需科学上网）；同时建议到 NVIDIA 官网更新显卡驱动（CUDA 13 需驱动 580 及以上）`;
}
async function requestJson(url, init, timeoutMs = 3e4) {
  const timeout = AbortSignal.timeout(timeoutMs);
  const signal = init?.signal
    ? AbortSignal.any([init.signal, timeout])
    : timeout;
  const response = await fetch(`${getBackendHost()}${url}`, {
    ...init,
    signal,
  });
  if (!response.ok) {
    let detail = "";
    try {
      const raw = await response.text();
      try {
        const parsed = JSON.parse(raw);
        const validationErrors =
          parsed?.node_errors || parsed?.error?.node_errors;
        if (validationErrors) {
          const nodeErrors = Object.entries(validationErrors).map(
            ([id, info]) =>
              `${id}: ${info?.errors?.map((e) => e?.message || e?.details || JSON.stringify(e)).join("; ") || JSON.stringify(info)}`,
          );
          detail = `节点错误 - ${nodeErrors.join(" | ")}`;
        } else if (parsed?.error?.message) {
          detail = String(parsed.error.message);
        } else {
          detail = raw.slice(0, 800);
        }
      } catch {
        detail = raw.slice(0, 800);
      }
    } catch {}
    throw new Error(
      `本地引擎请求失败 (${response.status})${detail ? `：${detail}` : ""}`,
    );
  }
  return await response.json();
}
async function isHealthy() {
  try {
    const [nativeResponse, sagePatchResponse] = await Promise.all([
      fetch(`${getBackendHost()}/object_info/MiniMaxH3ReferenceToVideo`, {
        signal: AbortSignal.timeout(2500),
      }),
      fetch(`${getBackendHost()}/object_info/PathchSageAttentionKJ`, {
        signal: AbortSignal.timeout(2500),
      }),
    ]);
    if (!nativeResponse.ok || !sagePatchResponse.ok) return false;
    const [nativeText, sageText] = await Promise.all([
      nativeResponse.text(),
      sagePatchResponse.text(),
    ]);
    return (
      nativeText.includes("MiniMaxH3ReferenceToVideo") &&
      sageText.includes("PathchSageAttentionKJ")
    );
  } catch {
    return false;
  }
}
async function unloadModels() {
  if (!(await isHealthy())) return;
  await fetch(`${getBackendHost()}/free`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ unload_models: true, free_memory: true }),
    signal: AbortSignal.timeout(12e4),
  }).catch(() => void 0);
}
function writeExtraModelsConfig(engineDir) {
  const configPath = node_path.join(workspaceDir(), "extra_model_paths.yaml");
  const root = defaultModelsDir().replace(/\\/g, "/");
  const ownConfig = [
    `yunhui_models:`,
    `  base_path: "${root}"`,
    `  diffusion_models: .`,
    `  unet: .`,
    `  text_encoders: .`,
    `  clip: .`,
    `  vae: .`,
    `  checkpoints: .`,
    `  loras: .`,
    `  background_removal: .`,
  ].join("\n");
  const candidates = [
    node_path.join(defaultModelsDir(), "extra_model_paths.yaml"),
    node_path.join(defaultModelsDir(), "extra_model_paths.yml"),
    ...(engineDir ? [node_path.join(engineDir, "extra_model_paths.yaml")] : []),
  ];
  const imported = candidates
    .filter(
      (file, index) =>
        node_fs.existsSync(file) &&
        candidates.indexOf(file) === index &&
        file !== configPath,
    )
    .map((file) => {
      try {
        return `
# Imported from ${file.replace(/\\/g, "/")}
${node_fs.readFileSync(file, "utf8").trim()}`;
      } catch {
        return "";
      }
    })
    .filter(Boolean)
    .join("\n");
  node_fs.writeFileSync(
    configPath,
    `${ownConfig}${imported}
`,
    "utf8",
  );
  return configPath;
}
async function startBackend(onLog) {
  backendStopping = false;
  if (isRemoteMode()) {
    activeLongVideoSafetyMode = false;
    activeLongVideoPytorchBase = false;
    onLog?.(`正在连接远程后端: ${getBackendHost()}`);
    try {
      const healthy2 = await isHealthy();
      if (healthy2) {
        const remoteFiles = await fetchRemoteModelFiles();
        setRemoteModelFiles(remoteFiles);
        backendState = "ready";
        backendMessage = `已连接远程后端: ${getBackendHost()}`;
        onLog?.(backendMessage);
        onLog?.(`远程模型: ${remoteFiles.length} 个文件`);
      } else {
        setRemoteModelFiles(null);
        backendState = "starting";
        backendMessage = `无法连接远程后端: ${getBackendHost()}`;
        onLog?.(backendMessage);
      }
    } catch (err) {
      setRemoteModelFiles(null);
      backendState = "offline";
      backendMessage = `远程后端连接失败: ${err instanceof Error ? err.message : String(err)}`;
    }
    return getBackendStatus();
  }
  if (!getWorkspaceSettings().configured) {
    backendState = "offline";
    backendMessage = "请先选择模型文件夹、输出文件夹和外部 ComfyUI 目录";
    return getBackendStatus();
  }
  const availableEngine = engineCandidates().find((directory) =>
    node_fs.existsSync(node_path.join(directory, "main.py")),
  );
  if (!availableEngine) {
    backendState = "offline";
    backendMessage = "请先在工作区里选择外部 ComfyUI 安装目录，或设置 COMFYUI_PATH";
    return getBackendStatus();
  }
  if (await isHealthy()) {
    backendState = "ready";
    backendMessage = "本地 H3 引擎已就绪";
    return getBackendStatus();
  }
  if (backendProcess && !backendProcess.killed) return getBackendStatus();
  const checks = modelChecks();
  const missing = checks.filter((model) => model.required && !model.found);
  const hasH3BaseModel = checks.some(
    (model) =>
      (model.key === "diffusion" || model.key === "fl2va") && model.found,
  );
  if (!hasH3BaseModel) {
    backendState = "error";
    backendMessage = "缺少 H3 主模型：Ref2VA 与 FL2VA 至少需要安装一个";
    return getBackendStatus();
  }
  if (missing.length) {
    backendState = "error";
    backendMessage = `缺少 ${missing.map((item) => item.label).join("、")}`;
    return getBackendStatus();
  }
  try {
    const runtime = await resolveRuntime(onLog, (message2) => {
      backendState = "starting";
      backendMessage = message2;
    });
    activeEngineDir = runtime.engineDir;
    activeToolDir = runtime.toolDir;
    activeTtsEngineDir = runtime.ttsEngineDir;
    activePythonPath = runtime.pythonPath;
    try {
      const gpu = await probeGpuRuntime(activePythonPath, activeEngineDir);
      if (gpu.state !== "ok") {
        backendState = "error";
        backendMessage =
          gpu.state === "no-cuda"
            ? "检测不到可用的 NVIDIA CUDA：请到 NVIDIA 官网更新显卡驱动（CUDA 13 需 580 及以上）后重试；双显卡笔记本请在 Windows 图形设置中让韵绘使用高性能独显"
            : gpu.state === "unsupported"
              ? `显卡不支持本地引擎：${gpu.detail}（架构早于 RTX 20 系）。本地生图/生视频需 RTX 20 系及以上显卡，可先使用云端生成功能`
              : `PyTorch 运行时异常（${gpu.detail}）：${runtimeRecoveryHint()}`;
        onLog?.(backendMessage);
        return getBackendStatus();
      }
      onLog?.(`>>> GPU 预检通过：${gpu.detail}`);
    } catch (error) {
      onLog?.(
        `>>> GPU 预检跳过（${error instanceof Error ? error.message : String(error)}）`,
      );
    }
    backendState = "starting";
    backendMessage = "正在加载 MiniMax H3 引擎…";
    backendLogTail = [];
    const launchLongVideoSafetyMode = requestedLongVideoSafetyMode;
    const launchPytorchBase = requestedLongVideoPytorchBase;
    const args = [
      node_path.join(runtime.engineDir, "main.py"),
      "--listen",
      "0.0.0.0",
      "--port",
      String(PORT$2),
      "--disable-auto-launch",
      "--extra-model-paths-config",
      writeExtraModelsConfig(runtime.engineDir),
      "--input-directory",
      inputDir(),
      "--output-directory",
      outputDir(),
    ];
    const settings = getWorkspaceSettings();
    let hardVramBudget;
    let budgetNeedsPytorch = false;
    const vramMode = effectiveVramMode(settings);
    if ((settings.vramMode || "auto") === "auto") {
      onLog?.(
        `>>> 已按显卡总显存自动选择 ${vramMode === "low8" ? "8G" : vramMode === "low12" ? "12G" : vramMode === "mid24" ? "24G" : vramMode === "high32" ? "32G" : "48G+"} GPU预算（H3 与生图共用）`,
      );
    }
    if (vramMode === "low8" || vramMode === "low12") {
      hardVramBudget = vramBudget(vramMode === "low8" ? 8 : 12);
      args.push(
        ...(hardVramBudget && hardVramBudget.reserveGb > 0
          ? ["--reserve-vram", String(hardVramBudget.reserveGb)]
          : []),
        "--enable-dynamic-vram",
      );
      budgetNeedsPytorch = true;
      onLog?.(
        `>>> H3 ${vramMode === "low8" ? "8" : "12"}GB GPU预算已启用${hardVramBudget ? `（引擎 ${hardVramBudget.engineBudgetGb}GB；系统基线 ${hardVramBudget.baselineGb}GB 另计）` : ""}`,
      );
    } else if (vramMode === "mid24") {
      hardVramBudget = vramBudget(24);
      if (hardVramBudget && hardVramBudget.reserveGb > 0)
        args.push("--reserve-vram", String(hardVramBudget.reserveGb));
      args.push("--enable-dynamic-vram");
      budgetNeedsPytorch = true;
      onLog?.(
        `>>> H3 24GB GPU预算已启用${hardVramBudget ? `（引擎 ${hardVramBudget.engineBudgetGb}GB；系统基线 ${hardVramBudget.baselineGb}GB 另计）` : ""}`,
      );
    } else if (vramMode === "high32") {
      hardVramBudget = vramBudget(32);
      if (hardVramBudget && hardVramBudget.reserveGb > 0)
        args.push("--reserve-vram", String(hardVramBudget.reserveGb));
      args.push("--enable-dynamic-vram");
      onLog?.(
        `>>> H3 32GB GPU预算已启用${hardVramBudget ? `（引擎 ${hardVramBudget.engineBudgetGb}GB；系统基线 ${hardVramBudget.baselineGb}GB 另计）` : ""}`,
      );
    }
    if (
      launchLongVideoSafetyMode &&
      (vramMode === "low8" || vramMode === "low12" || vramMode === "mid24")
    ) {
      args.push("--lowvram");
      onLog?.(
        ">>> H3 15 秒安全显存模式已启用（保持原分辨率，采用低峰值模型调度）",
      );
    }
    if (launchPytorchBase || forceStableH3Mode || budgetNeedsPytorch) {
      args.push("--use-pytorch-cross-attention");
      onLog?.(
        forceStableH3Mode
          ? ">>> 检测到本次会话曾发生 CUDA 原生崩溃，已锁定 PyTorch 稳定注意力模式"
          : budgetNeedsPytorch
            ? ">>> 12G 档已禁用 Sage，使用 PyTorch 稳定注意力与CPU卸载"
            : ">>> H3 长视频基础注意力已固定为 PyTorch；长序列任务不会再套用 SG",
      );
    } else if (settings.sageAttention) {
      const sageCheck = node_child_process.spawnSync(
        runtime.pythonPath,
        [
          "-c",
          'from sageattention import sageattn; import importlib.metadata as m; assert m.version("sageattention") == "1.0.6"',
        ],
        {
          cwd: runtime.engineDir,
          windowsHide: true,
          encoding: "utf8",
          timeout: 15e3,
        },
      );
      if (sageCheck.status === 0) {
        args.push("--use-sage-attention");
        onLog?.(">>> SageAttention 2 已启用（RTX 40 系兼容路径）");
      } else {
        onLog?.(
          `>>> SageAttention 不可用（导入失败），本次启动未启用加速。错误: ${(sageCheck.stderr || sageCheck.stdout || "").trim().slice(0, 200)}`,
        );
        onLog?.(
          ">>> 提示：在「设置 - Sage Attention 加速」可关闭此提示，或重装引擎依赖恢复加速",
        );
      }
    }
    backendProcess = node_child_process.spawn(runtime.pythonPath, args, {
      cwd: runtime.engineDir,
      windowsHide: true,
      env: {
        ...process.env,
        PYTHONUTF8: "1",
        // 引擎内 transformers/HF hub 默认从 huggingface.co 下载模型，无代理网络会卡死或
        // 在原生加载路径上崩溃（access violation）；切到国内镜像（用户已设置时尊重用户值）。
        HF_ENDPOINT: process.env.HF_ENDPOINT?.trim() || "https://hf-mirror.com",
        // 所有本地模式都启用可扩展显存段；不减少可用显存，只降低长视频反复申请大块显存时的碎片化。
        PYTORCH_CUDA_ALLOC_CONF:
          process.env.PYTORCH_CUDA_ALLOC_CONF || "expandable_segments:True",
      },
    });
    const launchedProcess = backendProcess;
    activeLongVideoSafetyMode = launchLongVideoSafetyMode;
    activeLongVideoPytorchBase = launchPytorchBase;
    const handleLine = (chunk) => {
      const line = chunk.toString("utf8").trim();
      if (line) {
        backendLogTail = [
          ...backendLogTail,
          ...line.split(/\r?\n/).filter(Boolean),
        ].slice(-120);
        onLog?.(line);
      }
    };
    launchedProcess.stdout.on("data", handleLine);
    launchedProcess.stderr.on("data", handleLine);
    launchedProcess.once("error", (error) => {
      if (backendProcess !== launchedProcess) return;
      backendProcess = null;
      backendState = "error";
      backendMessage = `无法启动本地引擎：${error.message}`;
      onLog?.(backendMessage);
    });
    let autoRestarted = false;
    launchedProcess.once("exit", (code) => {
      if (backendProcess !== launchedProcess) return;
      backendProcess = null;
      const wasReady = backendState === "ready";
      backendState = "error";
      const diagnostic = backendCrashDiagnostic(backendLogTail);
      const crashLogPath = writeBackendCrashLog(code, backendLogTail);
      forceStableH3Mode = true;
      requestedLongVideoPytorchBase = true;
      if (!wasReady) {
        backendMessage = `本地引擎启动失败（${code ?? "未知"}${code === 3221225477 ? "·访问违例" : ""}）${diagnostic ? `：${diagnostic.slice(0, 240)}` : ""}。${runtimeRecoveryHint()}`;
        onLog?.(backendMessage);
        onLog?.(`[crash-log] 完整崩溃日志：${crashLogPath}`);
        if (!autoRestarted && !backendStopping) {
          autoRestarted = true;
          onLog?.("[auto-restart] 3 秒后自动重试启动一次…");
          scheduleAutoRestart(onLog);
        }
        return;
      }
      backendMessage = `本地引擎异常退出 (${code ?? "未知"})${diagnostic ? `：${diagnostic.slice(0, 360)}` : ""}；已切换稳定模式并准备恢复任务`;
      onLog?.(backendMessage);
      onLog?.(`[crash-log] 完整崩溃日志：${crashLogPath}`);
      if (wasReady && !autoRestarted && !backendStopping) {
        autoRestarted = true;
        onLog?.("[auto-restart] 引擎异常退出，3 秒后自动重启…");
        setTimeout(() => {
          restartBackend(onLog)
            .then(() => onLog?.("[auto-restart] 引擎已自动重启"))
            .catch((err) =>
              onLog?.(
                `[auto-restart] 自动重启失败：${err instanceof Error ? err.message : String(err)}`,
              ),
            );
        }, 3e3);
      }
    });
    const deadline = Date.now() + 18e4;
    while (Date.now() < deadline) {
      if (await isHealthy()) {
        backendState = "ready";
        backendMessage = "本地 H3 引擎已就绪";
        return getBackendStatus();
      }
      if (!backendProcess) throw new Error(backendMessage);
      await new Promise((resolvePromise) => setTimeout(resolvePromise, 1500));
    }
    throw new Error("本地引擎启动超时，请查看运行日志");
  } catch (error) {
    backendState = "error";
    backendMessage =
      error instanceof Error ? error.message : "本地引擎启动失败";
    return getBackendStatus();
  }
}
async function getBackendStatus() {
  const healthy2 = await isHealthy();
  if (isRemoteMode()) {
    if (backendState !== "offline") {
      if (healthy2) {
        backendState = "ready";
        backendMessage = `已连接远程后端: ${getBackendHost()}`;
        setRemoteModelFiles(await fetchRemoteModelFiles());
      } else {
        backendState = "error";
        backendMessage = "远程后端连接已断开，请检查远程软件是否运行";
        setRemoteModelFiles(null);
      }
    }
  } else {
    if (healthy2) {
      backendState = "ready";
      backendMessage = "本地 H3 引擎已就绪";
    } else if (backendState === "ready") {
      backendState = "error";
      backendMessage = "本地引擎连接已断开，请点击重新启动";
    }
  }
  let gpu;
  if (backendState === "ready") {
    try {
      const stats = await requestJson("/system_stats");
      const device = stats?.devices?.[0];
      if (device) {
        gpu = {
          name: device.name || "NVIDIA GPU",
          vramTotalMb: Math.round((device.vram_total || 0) / 1024 ** 2),
          vramFreeMb: Math.round((device.vram_free || 0) / 1024 ** 2),
        };
      }
    } catch {}
  }
  return {
    state: backendState,
    message: backendMessage,
    port: PORT$2,
    modelsDir: defaultModelsDir(),
    outputDir: outputDir(),
    engineDir: activeEngineDir || void 0,
    ttsEngineDir: activeTtsEngineDir || void 0,
    pythonPath: activePythonPath || void 0,
    models: modelChecks(),
    loras: loraInfos(),
    h3AccelerationLoras: h3AccelerationLoraInfos(),
    gpu,
  };
}
function stopBackend() {
  backendStopping = true;
  if (autoRestartTimer) {
    clearTimeout(autoRestartTimer);
    autoRestartTimer = null;
  }
  if (backendProcess && !backendProcess.killed) backendProcess.kill();
  backendProcess = null;
}
function getTtsEngineDir() {
  return activeTtsEngineDir;
}
function getActivePythonPath() {
  return activePythonPath;
}
function restartBackend(onLog) {
  if (backendRestartPromise) return backendRestartPromise;
  backendRestartPromise = (async () => {
    stopBackend();
    backendState = "offline";
    backendMessage = "正在应用新的文件夹设置…";
    const deadline = Date.now() + 1e4;
    while (Date.now() < deadline && (await isHealthy())) {
      await new Promise((resolvePromise) => setTimeout(resolvePromise, 400));
    }
    return startBackend(onLog);
  })().finally(() => {
    backendRestartPromise = null;
  });
  return backendRestartPromise;
}
async function ensureEngineReady() {
  if (await isHealthy()) return;
  const status = await restartBackend(() => {});
  if (status.state !== "ready")
    throw new Error(status.message || "本地引擎尚未就绪");
}
async function finalizeFromHistory(taskId, record, onUpdate) {
  const outputCandidates = Object.values(record.outputs || {}).flatMap((item) => [
    ...(Array.isArray(item?.images) ? item.images : []),
    ...(Array.isArray(item?.videos) ? item.videos : []),
    ...(Array.isArray(item?.gifs) ? item.gifs : []),
    ...(Array.isArray(item?.audio) ? item.audio : []),
    ...(Array.isArray(item?.files) ? item.files : []),
    // easy saveText 等文本类输出以 filename/subfolder/type 形式出现在 text 键下
    ...(Array.isArray(item?.text) ? item.text : []),
  ]).filter((item) => item?.filename);
  // 优先取“正式保存”的输出（save 类节点写在输出目录），Preview 类节点是 temp 预览，
  // 其文件不在输出目录内；没有正式输出时再回退到预览（音频工作流可能只有预览节点）。
  const output =
    outputCandidates.find((item) => item.type !== "temp" && String(item.subfolder || "") !== "temp") ||
    outputCandidates[0];
  const outputItems = Object.values(record.outputs || {})
    .flatMap((item) => [
      ...(Array.isArray(item?.images) ? item.images : []),
      ...(Array.isArray(item?.videos) ? item.videos : []),
      ...(Array.isArray(item?.gifs) ? item.gifs : []),
      ...(Array.isArray(item?.audio) ? item.audio : []),
      ...(Array.isArray(item?.files) ? item.files : []),
      ...(Array.isArray(item?.text) ? item.text : []),
    ])
    .filter((item) => item?.filename);
  const outputPaths = (
    await Promise.all(
      outputItems.map((item) =>
        resolveOutputPath(item.filename, item.subfolder || ""),
      ),
    )
  ).filter((item) => Boolean(item));
  let outputPath =
    outputPaths[0] ||
    (output
      ? await resolveOutputPath(output.filename, output.subfolder || "", output.type || "output")
      : void 0);
  // 语音转文本等文本类输出：历史记录里只有字符串文本（无文件名），落盘为 txt 供结果卡片引用
  const textStrings = Object.values(record.outputs || {}).flatMap((item) => {
    const text2 = item?.text;
    if (typeof text2 === "string") return [text2];
    if (Array.isArray(text2)) return text2.filter((entry) => typeof entry === "string");
    return [];
  });
  if (!outputPath && textStrings.length) {
    const task2 = tasks.get(taskId);
    const baseName = String(task2?.workflowName || "transcript")
      .replace(/\.[^.]+$/, "")
      .replace(/[\\/:*?"<>|]+/g, "_");
    const dir = node_path.join(outputDir(), "h3-transcripts");
    node_fs.mkdirSync(dir, { recursive: true });
    const filePath = node_path.join(dir, `${baseName}_${Date.now()}.txt`);
    node_fs.writeFileSync(filePath, textStrings.join("\n\n"), "utf8");
    outputPath = filePath;
    outputPaths = [filePath];
  }
  const finished = updateTask(taskId, {
    status: "succeeded",
    progress: 100,
    outputPath,
    outputUrl: outputPath
      ? node_url.pathToFileURL(outputPath).toString()
      : void 0,
    outputPaths: outputPaths.length
      ? outputPaths
      : outputPath
        ? [outputPath]
        : void 0,
    recoveryGraph: void 0,
    recoveryAttempts: void 0,
  });
  await flushTaskPersistence();
  onUpdate(finished);
}
function executionErrorMessage(record, fallback) {
  const messages = record?.status?.messages || [];
  const executionError = messages.find(
    (item) => item?.[0] === "execution_error",
  );
  return executionError?.[1]?.exception_message || fallback;
}
async function promptQueueState(promptId) {
  const queue = await requestJson("/queue", void 0, 1e4);
  const containsPrompt = (entries) =>
    entries.some((entry) => Array.isArray(entry) && entry[1] === promptId);
  if (containsPrompt(queue?.queue_running || [])) return "running";
  if (containsPrompt(queue?.queue_pending || [])) return "pending";
  return "missing";
}
async function recoverAfterEngineLoss(taskId, promptId, onUpdate, graph) {
  if (isRemoteMode()) return { done: false };
  const current = tasks.get(taskId);
  if (!current || current.status === "cancelled") return { done: true };
  onUpdate(
    updateTask(taskId, { error: "引擎连接中断，正在确认真实队列并恢复任务…" }),
  );
  try {
    if (!(await isHealthy())) {
      setBackendMessage("检测到引擎异常退出，正在自动重启…");
      await new Promise((resolvePromise) => setTimeout(resolvePromise, 3500));
      let status = (await isHealthy())
        ? await getBackendStatus()
        : await restartBackend();
      if (status.state === "starting") {
        const readyDeadline = Date.now() + 18e4;
        while (Date.now() < readyDeadline) {
          if (await isHealthy()) {
            status = await getBackendStatus();
            break;
          }
          if (!isEngineProcessAlive() && getEngineStateValue() === "error")
            break;
          await new Promise((resolvePromise) =>
            setTimeout(resolvePromise, 2e3),
          );
        }
      }
      if (status.state !== "ready") {
        throw new Error(status.message || "H3 引擎自动重启失败，任务无法继续");
      }
    }
    const history = await requestJson(`/history/${promptId}`, void 0, 15e3);
    const record = history[promptId];
    if (record?.status?.completed) {
      await finalizeFromHistory(taskId, record, onUpdate);
      return { done: true };
    }
    if (record?.status?.status_str === "error") {
      throw new Error(executionErrorMessage(record, "本地推理执行失败"));
    }
    if ((await promptQueueState(promptId)) !== "missing")
      return { done: false, promptId };
    if (!graph)
      throw new Error("引擎重启后旧任务已从队列丢失，且没有可重提的工作流");
    const usedSageFallback = graph["6"]?.class_type === "PathchSageAttentionKJ";
    if (usedSageFallback) {
      delete graph["6"];
      graph["33"].inputs.model = ["5", 0];
    }
    const queued = await requestJson(
      "/prompt",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: graph, client_id: taskId }),
      },
      3e4,
    );
    if (!queued.prompt_id)
      throw new Error(
        `引擎恢复后任务重提失败：${JSON.stringify(queued.error || "未知错误")}`,
      );
    const resumed = updateTask(taskId, {
      backendPromptId: queued.prompt_id,
      status: "running",
      progress: 14,
      error: usedSageFallback
        ? "引擎已恢复；本次已自动关闭 SG 并改用 PyTorch 注意力重新进入真实队列…"
        : "引擎已恢复，工作流已重新进入真实队列，正在重新加载模型…",
    });
    await flushTaskPersistence();
    onUpdate(resumed);
    return { done: false, promptId: queued.prompt_id };
  } catch (error) {
    onUpdate(
      updateTask(taskId, {
        status: "failed",
        progress: 0,
        error:
          error instanceof Error ? error.message : "引擎中断，任务未能完成",
      }),
    );
    return { done: true };
  }
}
async function pollGeneration(taskId, initialPromptId, onUpdate, graph) {
  let promptId = initialPromptId;
  let progress = 14;
  let consecutiveFetchFailures = 0;
  let missingFromQueuePolls = 0;
  let recoveryCount = 0;
  const maxConsecutiveFetchFailures = 4;
  try {
    while (true) {
      if (tasks.get(taskId)?.status === "cancelled") return;
      let record;
      try {
        const history = await requestJson(`/history/${promptId}`);
        record = history[promptId];
        consecutiveFetchFailures = 0;
      } catch (fetchError) {
        consecutiveFetchFailures += 1;
        if (consecutiveFetchFailures < maxConsecutiveFetchFailures) {
          await new Promise((resolvePromise) =>
            setTimeout(resolvePromise, 2500),
          );
          continue;
        }
        if (!isRemoteMode() && isEngineProcessAlive()) {
          onUpdate(
            updateTask(taskId, {
              status: "running",
              progress,
              backendPromptId: promptId,
              error:
                "H3 引擎进程仍在运行，当前长视频计算繁忙，等待真实队列响应…",
            }),
          );
          consecutiveFetchFailures = 0;
          await new Promise((resolvePromise) =>
            setTimeout(resolvePromise, 5e3),
          );
          continue;
        }
        if (recoveryCount >= 1)
          throw new Error(
            `H3 引擎恢复后再次中断：${fetchError instanceof Error ? fetchError.message : String(fetchError)}`,
          );
        const recovered = await recoverAfterEngineLoss(
          taskId,
          promptId,
          onUpdate,
          graph,
        );
        if (recovered.done) return;
        if (recovered.promptId) promptId = recovered.promptId;
        recoveryCount += 1;
        consecutiveFetchFailures = 0;
        missingFromQueuePolls = 0;
        progress = 14;
        continue;
      }
      if (record) {
        const statusText = record.status?.status_str;
        if (statusText === "error") {
          const messages = record.status?.messages || [];
          const executionError = messages.find(
            (item) => item?.[0] === "execution_error",
          );
          throw new Error(
            executionError?.[1]?.exception_message || "本地推理执行失败",
          );
        }
        if (record.status?.completed) {
          await finalizeFromHistory(taskId, record, onUpdate);
          return;
        }
      }
      const queueState = await promptQueueState(promptId).catch(
        () => "unreachable",
      );
      if (queueState === "unreachable") {
        if (!isRemoteMode() && isEngineProcessAlive()) {
          onUpdate(
            updateTask(taskId, {
              status: "running",
              progress,
              backendPromptId: promptId,
              error: "H3 引擎进程仍在运行，等待真实队列恢复响应…",
            }),
          );
          await new Promise((resolvePromise) =>
            setTimeout(resolvePromise, 5e3),
          );
          continue;
        }
        if (recoveryCount >= 1)
          throw new Error("H3 引擎恢复后再次失去连接，已停止任务");
        const recovered = await recoverAfterEngineLoss(
          taskId,
          promptId,
          onUpdate,
          graph,
        );
        if (recovered.done) return;
        if (recovered.promptId) promptId = recovered.promptId;
        recoveryCount += 1;
        missingFromQueuePolls = 0;
        progress = 14;
        continue;
      }
      if (queueState === "missing") {
        missingFromQueuePolls += 1;
        if (missingFromQueuePolls >= 3) {
          if (recoveryCount >= 1)
            throw new Error(
              "H3 引擎已就绪，但恢复后的任务不在真实队列中，已停止假进度",
            );
          const recovered = await recoverAfterEngineLoss(
            taskId,
            promptId,
            onUpdate,
            graph,
          );
          if (recovered.done) return;
          if (recovered.promptId) promptId = recovered.promptId;
          recoveryCount += 1;
          missingFromQueuePolls = 0;
          progress = 14;
          continue;
        }
        await new Promise((resolvePromise) => setTimeout(resolvePromise, 2500));
        continue;
      }
      missingFromQueuePolls = 0;
      if (queueState === "pending") {
        onUpdate(
          updateTask(taskId, {
            status: "queued",
            progress,
            backendPromptId: promptId,
            error: void 0,
          }),
        );
        await new Promise((resolvePromise) => setTimeout(resolvePromise, 2500));
        continue;
      }
      progress = Math.max(progress, 15);
      onUpdate(
        updateTask(taskId, {
          status: "running",
          progress,
          backendPromptId: promptId,
          error: void 0,
        }),
      );
      await new Promise((resolvePromise) => setTimeout(resolvePromise, 2500));
    }
  } catch (error) {
    if (tasks.get(taskId)?.status === "cancelled") return;
    onUpdate(
      updateTask(taskId, {
        status: "failed",
        progress: 0,
        error: error instanceof Error ? error.message : "生成失败",
      }),
    );
  }
}
const resumedPersistedPolls = /* @__PURE__ */ new Set();
let persistedRecoveryPromise = null;
function resumePersistedPoll(taskId, promptId, onUpdate, graph) {
  if (resumedPersistedPolls.has(taskId)) return;
  resumedPersistedPolls.add(taskId);
  void pollGeneration(taskId, promptId, onUpdate, graph).finally(() => {
    resumedPersistedPolls.delete(taskId);
  });
}
async function recoverPersistedTasks(onUpdate) {
  ensureTasksLoaded();
  if (persistedRecoveryPromise) return persistedRecoveryPromise;
  const pending = [...tasks.values()].filter(
    (task) => task.status === "queued" || task.status === "running",
  );
  if (!pending.length || !(await isHealthy())) return;
  persistedRecoveryPromise = (async () => {
    for (const stored of pending) {
      const current = tasks.get(stored.id);
      if (
        !current ||
        (current.status !== "queued" && current.status !== "running") ||
        resumedPersistedPolls.has(current.id)
      )
        continue;
      const promptId = providerPromptId(current);
      if (!promptId) {
        onUpdate(
          updateTask(current.id, {
            // This is a stale pre-prompt-id record, not a failure of the
            // current generation. Retire it quietly so startup recovery does
            // not present an alarming red error or resubmit an unknown job.
            status: "cancelled",
            progress: 0,
            error: void 0,
          }),
        );
        continue;
      }
      try {
        const history = await requestJson(`/history/${promptId}`, void 0, 15e3);
        const record = history[promptId];
        if (record?.status?.completed) {
          await finalizeFromHistory(current.id, record, onUpdate);
          continue;
        }
        if (record?.status?.status_str === "error") {
          onUpdate(
            updateTask(current.id, {
              status: "failed",
              progress: 0,
              error: executionErrorMessage(
                record,
                "软件重启后确认本地推理任务已失败",
              ),
            }),
          );
          continue;
        }
        const queueState = await promptQueueState(promptId);
        const graph = current.recoveryGraph
          ? structuredClone(current.recoveryGraph)
          : void 0;
        if (queueState !== "missing") {
          const resumed = updateTask(current.id, {
            status: queueState === "running" ? "running" : "queued",
            backendPromptId: promptId,
            error: void 0,
          });
          onUpdate(resumed);
          resumePersistedPoll(current.id, promptId, onUpdate, graph);
          continue;
        }
        if (!isRemoteMode() && graph && (current.recoveryAttempts || 0) < 1) {
          updateTask(current.id, { recoveryAttempts: 1 });
          const recovered = await recoverAfterEngineLoss(
            current.id,
            promptId,
            onUpdate,
            graph,
          );
          if (!recovered.done && recovered.promptId) {
            resumePersistedPoll(
              current.id,
              recovered.promptId,
              onUpdate,
              graph,
            );
          }
          continue;
        }
        onUpdate(
          updateTask(current.id, {
            status: "failed",
            progress: 0,
            error: graph
              ? "软件重启后旧任务不在历史或真实队列中；已达到安全恢复次数，不再重复提交"
              : "软件重启后旧任务不在历史或真实队列中，且旧版本未保存工作流，无法安全重提",
          }),
        );
      } catch (error) {
        onUpdate(
          updateTask(current.id, {
            error: `恢复检查暂未完成：${error instanceof Error ? error.message : String(error)}`,
          }),
        );
      }
    }
  })().finally(() => {
    persistedRecoveryPromise = null;
  });
  return persistedRecoveryPromise;
}
async function postInterruptWithRetry() {
  if (!(await isHealthy())) return;
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      await fetch(`${getBackendHost()}/interrupt`, {
        method: "POST",
        signal: AbortSignal.timeout(8e3),
      });
      return;
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 1500));
    }
  }
}
async function clearQueueWithRetry() {
  if (!(await isHealthy())) return;
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      await fetch(`${getBackendHost()}/queue`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clear: true }),
        signal: AbortSignal.timeout(8e3),
      });
      return;
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 1500));
    }
  }
}
async function interruptGeneration(onUpdate) {
  ensureTasksLoaded();
  for (const [id, task] of tasks) {
    if (task.status !== "queued" && task.status !== "running") continue;
    const cancelled = updateTask(id, {
      status: "cancelled",
      progress: 0,
      error: "用户已停止生成",
    });
    onUpdate?.(cancelled);
  }
  for (const controller of pendingSubmissions.values()) controller.abort();
  pendingSubmissions.clear();
  await postInterruptWithRetry();
  await clearQueueWithRetry();
}
async function cancelSingleTask(taskId, onUpdate) {
  ensureTasksLoaded();
  const current = tasks.get(taskId);
  if (!current || (current.status !== "queued" && current.status !== "running"))
    return;
  const promptId = current.backendPromptId;
  const queueState =
    promptId && (await isHealthy())
      ? await promptQueueState(promptId).catch(() => "missing")
      : "missing";
  const cancelled = updateTask(taskId, {
    status: "cancelled",
    progress: 0,
    error: "用户已停止生成",
  });
  onUpdate?.(cancelled);
  const controller = pendingSubmissions.get(taskId);
  if (controller) {
    controller.abort();
    pendingSubmissions.delete(taskId);
  }
  if (!(await isHealthy())) return;
  if (promptId && queueState === "pending") {
    await fetch(`${getBackendHost()}/queue`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ delete: [promptId] }),
      signal: AbortSignal.timeout(8e3),
    }).catch(() => void 0);
  }
  if (promptId && queueState === "running") {
    await postInterruptWithRetry();
  }
}
function asReference(filePath2) {
  const extension = node_path.extname(filePath2).toLowerCase();
  const kind = [".png", ".jpg", ".jpeg", ".webp", ".bmp"].includes(extension)
    ? "image"
    : [".mp4", ".mov", ".mkv", ".webm", ".avi"].includes(extension)
      ? "video"
      : "audio";
  const stat = node_fs.statSync(filePath2);
  return {
    id: node_crypto.randomUUID(),
    name: node_path.basename(filePath2),
    path: filePath2,
    url: node_url.pathToFileURL(filePath2).toString(),
    kind,
    size: stat.size,
  };
}
async function uploadReference(reference, taskId) {
  const form = new FormData();
  const bytes = new Blob([node_fs.readFileSync(reference.path)]);
  const safeName = reference.name.replace(/[^\p{L}\p{N}._-]+/gu, "_");
  form.append("image", bytes, safeName);
  form.append("subfolder", `h3/${taskId}`);
  form.append("type", "input");
  form.append("overwrite", "true");
  const result2 = await requestJson("/upload/image", {
    method: "POST",
    body: form,
  });
  return `${result2.subfolder}/${result2.name}`.replace(/\\/g, "/");
}
async function runCanvasImageTool(request) {
  await ensureEngineReady();
  await prepareLocalMode("image");
  if (!request.file || !node_fs.existsSync(request.file))
    throw new Error("找不到要处理的原始图片");
  if (asReference(request.file).kind !== "image")
    throw new Error("该功能只支持图片节点");
  if (
    [...tasks.values()].some(
      (task) => task.status === "queued" || task.status === "running",
    )
  ) {
    throw new Error("请等待当前本地生成任务完成后再处理图片");
  }
  await unloadModels();
  const id = node_crypto.randomUUID();
  const uploadedImage = await uploadReference(
    asReference(request.file),
    `canvas-tools/${id}`,
  );
  const graph = buildCanvasImageToolPrompt(request, uploadedImage);
  const queued = await requestJson("/prompt", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt: graph, client_id: id }),
  });
  if (!queued.prompt_id)
    throw new Error(
      `图片处理任务提交失败：${JSON.stringify(queued.error || "未知错误")}`,
    );
  const deadline = Date.now() + 45 * 6e4;
  let fetchFailures = 0;
  const maxConsecutiveFetchFailures = 4;
  while (Date.now() < deadline) {
    let record;
    try {
      const history = await requestJson(`/history/${queued.prompt_id}`);
      record = history[queued.prompt_id];
      fetchFailures = 0;
    } catch (fetchError) {
      fetchFailures += 1;
      if (fetchFailures >= maxConsecutiveFetchFailures) {
        if (!isRemoteMode() && !isEngineProcessAlive()) throw fetchError;
        fetchFailures = 0;
      }
      await new Promise((resolvePromise) => setTimeout(resolvePromise, 2e3));
      continue;
    }
    if (record?.status?.status_str === "error") {
      throw new Error(executionErrorMessage(record, "图片处理执行失败"));
    }
    if (record?.status?.completed) {
      const outputs = Object.values(record.outputs || {}).flatMap(
        (item) => item.images || [],
      );
      const validOutputs = outputs.filter(
        (item) => item.filename && (item.type === "output" || !item.type),
      );
      const outputPaths = [];
      for (const item of validOutputs) {
        const p = await resolveOutputPath(item.filename, item.subfolder || "");
        if (p) outputPaths.push(p);
      }
      if (!outputPaths.length)
        throw new Error("图片处理完成，但没有找到输出图片");
      const label =
        request.tool === "watermark"
          ? "去水印"
          : request.tool === "cutout"
            ? "抠图"
            : `高清 ${request.resolution?.toUpperCase()}`;
      await unloadModels();
      return { success: true, outputPaths, message: `${label}处理完成` };
    }
    await new Promise((resolvePromise) => setTimeout(resolvePromise, 2e3));
  }
  throw new Error("图片处理超时，请检查引擎运行日志");
}
async function submitPromptAndTrack(options, onUpdate) {
  let task = tasks.get(options.localId);
  if (!task) throw new Error(options.failureMessage);
  const submission = new AbortController();
  pendingSubmissions.set(options.localId, submission);
  try {
    const uploaded = /* @__PURE__ */ new Map();
    for (let index = 0; index < options.references.length; index += 1) {
      const reference = options.references[index];
      uploaded.set(
        reference.id,
        await uploadReference(reference, options.localId),
      );
      task = updateTask(options.localId, {
        progress: Math.round(4 + ((index + 1) / options.references.length) * 8),
      });
      onUpdate(task);
    }
    const graph = options.buildGraph(uploaded);
    const queued = await requestJson("/prompt", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: graph, client_id: options.localId }),
      signal: submission.signal,
    });
    pendingSubmissions.delete(options.localId);
    if (!queued.prompt_id)
      throw new Error(
        `任务提交失败：${JSON.stringify(queued.error || "未知错误")}`,
      );
    task = updateTask(options.localId, {
      backendPromptId: queued.prompt_id,
      recoveryGraph: graph,
      recoveryAttempts: 0,
      status: "running",
      progress: options.runningProgress,
      error: void 0,
    });
    await flushTaskPersistence();
    onUpdate(task);
    void pollGeneration(options.localId, queued.prompt_id, onUpdate, graph);
    return task;
  } catch (error) {
    pendingSubmissions.delete(options.localId);
    const cancelled = tasks.get(options.localId);
    if (cancelled?.status === "cancelled") return cancelled;
    task = updateTask(options.localId, {
      status: "failed",
      progress: 0,
      error: error instanceof Error ? error.message : options.failureMessage,
    });
    onUpdate(task);
    throw error;
  }
}
async function createGeneration(request, onUpdate) {
  ensureTasksLoaded();
  const needsLongVideoSafety =
    !isRemoteMode() &&
    request.duration >= 12 &&
    request.width * request.height >= 8e5;
  const needsLongVideoEngineMode =
    needsLongVideoSafety &&
    (effectiveVramMode() === "low8" ||
      effectiveVramMode() === "low12" ||
      effectiveVramMode() === "mid24");
  const needsPytorchBase = needsLongVideoSafety;
  const engineFlags = getEngineModeFlags();
  if (
    needsLongVideoEngineMode !== engineFlags.activeLongVideoSafetyMode ||
    needsPytorchBase !== engineFlags.activeLongVideoPytorchBase
  ) {
    requestLongVideoModes(needsLongVideoEngineMode, needsPytorchBase);
    const status = await restartBackend();
    if (status.state !== "ready")
      throw new Error(
        `H3 引擎切换${needsPytorchBase ? "长视频稳定基础注意力" : needsLongVideoEngineMode ? "15 秒安全显存" : "标准"}模式失败：${status.message}`,
      );
  }
  await ensureEngineReady();
  if (!request.prompt.trim()) throw new Error("请输入视频提示词");
  const requestedAccelerationLoras = request.accelerationLoras?.length
    ? request.accelerationLoras
    : request.accelerationLora
      ? [request.accelerationLora]
      : [];
  if (requestedAccelerationLoras.length) {
    const valid = await remapLoraNames(requestedAccelerationLoras, "H3 LoRA");
    request = {
      ...request,
      accelerationLoras: valid,
      accelerationLora: void 0,
    };
  }
  if (request.videoMode === "reference" && !request.references.length)
    throw new Error("全参考模式至少需要一个参考素材");
  if (
    (request.videoMode === "image" || request.videoMode === "img2video") &&
    !request.references.some((item) => item.kind === "image")
  )
    throw new Error("图片驱动模式至少需要一张图片");
  const requestedH3Family =
    request.videoMode === "reference"
      ? request.h3ModelFamily || "ref2va"
      : "fl2va";
  const requestedH3Key = requestedH3Family === "fl2va" ? "fl2va" : "diffusion";
  if (!modelChecks().find((item) => item.key === requestedH3Key)?.found) {
    throw new Error(
      requestedH3Family === "fl2va"
        ? "当前任务选择了 FL2VA 图生视频底模，但模型目录中未找到 MiniMax H3 FL2VA 主模型"
        : "当前任务选择了 Ref2VA 全能参考底模，但模型目录中未找到 MiniMax H3 Ref2VA 主模型",
    );
  }
  const counts = request.references.reduce((acc, item) => {
    acc[item.kind] = (acc[item.kind] || 0) + 1;
    return acc;
  }, {});
  if (
    (counts.image || 0) > 9 ||
    (counts.video || 0) > 3 ||
    (counts.audio || 0) > 3
  ) {
    throw new Error("参考素材超过 H3 限制：图片 9、视频 3、音频 3");
  }
  if (request.videoMode === "image" && (counts.image || 0) > 2)
    throw new Error("首尾帧模式最多使用两张图片");
  if (request.videoMode === "img2video" && (counts.image || 0) > 1)
    throw new Error("图生视频模式最多使用一张图片");
  await prepareLocalMode("video", void 0, requestedH3Family);
  const localId = node_crypto.randomUUID();
  const seed = request.randomizeSeed
    ? Math.floor(Math.random() * Number.MAX_SAFE_INTEGER)
    : request.seed;
  const now = /* @__PURE__ */ new Date().toISOString();
  let task = {
    id: localId,
    prompt: request.prompt,
    status: "queued",
    progress: 2,
    createdAt: now,
    updatedAt: now,
    width: request.width,
    height: request.height,
    duration: request.duration,
    seed,
    kind: "video",
    videoMode: request.videoMode || "text",
    taskType:
      typeof request.taskType === "string" && request.taskType.trim()
        ? request.taskType
        : void 0,
  };
  tasks.set(localId, task);
  persistTasks();
  onUpdate(task);
  return submitPromptAndTrack(
    {
      localId,
      references: request.references,
      buildGraph: (uploaded) =>
        buildPrompt(
          request,
          uploaded,
          seed,
          getEngineModeFlags().forceStableH3Mode,
        ),
      runningProgress: 14,
      failureMessage: "任务创建失败",
    },
    onUpdate,
  );
}
async function comfyLoraNameMap() {
  try {
    const list = await requestJson("/models/loras");
    if (!Array.isArray(list) || !list.length) return null;
    const map = /* @__PURE__ */ new Map();
    for (const raw of list) {
      const name = String(raw);
      const base2 = node_path.basename(name);
      const preferLoras = /^loras[\\/]/i.test(name);
      if (!map.has(name) || preferLoras) map.set(name, name);
      if (!map.has(base2) || preferLoras) map.set(base2, name);
    }
    return map;
  } catch {
    return null;
  }
}
async function remapLoraNames(loras, label) {
  const map = await comfyLoraNameMap();
  if (!map) return loras;
  const mapped = [];
  const dropped = [];
  for (const lora of loras) {
    const engineName =
      map.get(lora.fileName) || map.get(node_path.basename(lora.fileName));
    if (engineName) mapped.push({ ...lora, fileName: engineName });
    else dropped.push(lora.fileName);
  }
  if (dropped.length)
    setBackendMessage(
      `已忽略引擎不识别的${label}：${dropped.join("、")}（重启本地引擎可刷新模型列表）`,
    );
  return mapped;
}
async function createImageGeneration(request, onUpdate) {
  ensureTasksLoaded();
  await ensureEngineReady();
  const hasImageReference = (request.references || []).some(
    (item) => item.kind === "image",
  );
  if (
    !request.prompt.trim() &&
    !(request.kreaMode === "img2img" && hasImageReference)
  )
    throw new Error("请输入图片提示词");
  const imageEngine = request.imageEngine || "krea2";
  const needed =
    imageEngine === "zimage"
      ? ["zimageDiffusion", "zimageTextEncoder", "zimageVae"]
      : ["kreaDiffusion", "kreaTextEncoder", "kreaVae"];
  const missing = needed
    .map((key) => modelChecks().find((model) => model.key === key))
    .filter((model) => !model?.found);
  if (missing.length)
    throw new Error(
      `${imageEngine === "zimage" ? "Z-Image" : "Krea2"} 模型不完整：${missing.map((model) => model?.label).join("、")}`,
    );
  if (request.loras && request.loras.length) {
    const loras = await remapLoraNames(request.loras, "LoRA");
    request = { ...request, loras };
  }
  await prepareLocalMode("image", void 0, imageEngine);
  const localId = node_crypto.randomUUID();
  const seed = request.randomizeSeed
    ? Math.floor(Math.random() * Number.MAX_SAFE_INTEGER)
    : request.seed;
  const now = /* @__PURE__ */ new Date().toISOString();
  const [outputWidth, outputHeight] = kreaOutputSize(request);
  const task = {
    id: localId,
    prompt: request.prompt,
    status: "queued",
    progress: 5,
    createdAt: now,
    updatedAt: now,
    width: outputWidth,
    height: outputHeight,
    duration: 0,
    seed,
    kind: "image",
    resolution: request.resolution,
    kreaMode: request.kreaMode || "txt2img",
    taskType:
      typeof request.taskType === "string" && request.taskType.trim()
        ? request.taskType
        : void 0,
  };
  tasks.set(localId, task);
  persistTasks();
  onUpdate(task);
  return submitPromptAndTrack(
    {
      localId,
      references: request.references || [],
      buildGraph: (uploaded) => buildImagePrompt(request, seed, uploaded),
      runningProgress: 15,
      failureMessage: "图片生成失败",
    },
    onUpdate,
  );
}
async function unloadAudioEngines() {
  try {
    const { unloadTtsModels: unloadTtsModels2 } = await Promise.resolve().then(
      () => tts,
    );
    await unloadTtsModels2();
  } catch {}
  try {
    const { unloadIndexTts: unloadIndexTts2 } = await Promise.resolve().then(
      () => indexTts,
    );
    await unloadIndexTts2();
  } catch {}
}
async function prepareLocalMode(mode, onUpdate, model) {
  const ownership = requestGpuOwnership("comfy");
  await enqueueModeTransition(async () => {
    try {
      const { stopVisionReverse: stopVisionReverse2 } =
        await Promise.resolve().then(() => visionReverse);
      await stopVisionReverse2();
    } catch {}
    await unloadAudioEngines();
    const current = getActiveLocalMode();
    const sameEngine =
      current?.split(":")[0] === mode &&
      (!model || current === `${mode}:${model}`);
    if (current && sameEngine) return;
    if (current) {
      await interruptGeneration(onUpdate);
      setBackendMessage("正在卸载上一套本地模型并释放显存…");
      await unloadModels();
    }
    setActiveLocalMode(model ? `${mode}:${model}` : mode);
    setBackendMessage("本地 H3 引擎已就绪");
  });
  assertGpuOwnership("comfy", ownership);
}
function releaseLocalGenerationGpu(onUpdate) {
  return enqueueModeTransition(async () => {
    await interruptGeneration(onUpdate);
    setBackendMessage("正在卸载 H3 / Krea2 并释放显存…");
    await unloadModels();
    setActiveLocalMode(null);
    await unloadAudioEngines();
    setBackendMessage("本地生成模型已卸载，显存可用于视觉反推");
  });
}
function killProcessTree(child) {
  if (!child || child.killed || !child.pid) return;
  if (process.platform === "win32") {
    try {
      const result2 = node_child_process.spawnSync(
        "taskkill.exe",
        ["/PID", String(child.pid), "/T", "/F"],
        { windowsHide: true, timeout: 1e4, stdio: "ignore" },
      );
      if (result2.status !== 0) child.kill("SIGKILL");
    } catch {
      try {
        child.kill("SIGKILL");
      } catch {}
    }
  } else {
    try {
      child.kill("SIGKILL");
    } catch {}
  }
}
function killComfyEngines() {
  // 结束本机所有 ComfyUI 引擎进程（以配置的 comfyuiDir 下的 python 运行 main.py 为准），
  // 覆盖：应用自己启动的引擎、被顺手接管的已有引擎、以及另外启动的 Comfy Desktop 实例。
  try {
    const dir = getWorkspaceSettings().comfyuiDir || "";
    if (!dir) return;
    const dirEscaped = dir.replace(/'/g, "''");
    const script = [
      `$d = '${dirEscaped}'`,
      "$all = Get-CimInstance Win32_Process -Filter \"Name='python.exe'\"",
      "$targets = $all | Where-Object { $_.CommandLine -and $_.CommandLine.ToLower().Contains('main.py') -and (($_.ExecutablePath -and $_.ExecutablePath.ToLower().Contains($d.ToLower())) -or $_.CommandLine.ToLower().Contains($d.ToLower())) } | Select-Object -ExpandProperty ProcessId",
      "$targets | ForEach-Object { & taskkill /PID $_ /T /F 2>$null | Out-Null }",
    ].join("; ");
    node_child_process.spawnSync(
      "powershell.exe",
      ["-NoProfile", "-NonInteractive", "-Command", script],
      { windowsHide: true, timeout: 3e4, stdio: "ignore" },
    );
  } catch {}
}
async function unloadAllGpuMemory() {
  setBackendMessage("正在彻底清理本应用显存…");
  // 1) 优雅卸载模型权重（ComfyUI /free + TTS / IndexTTS /unload）
  await releaseLocalGenerationGpu();
  // 2) 结束本应用启动的全部 GPU 进程（连同子进程树），把显存与 CUDA 上下文一并归还
  const engine = backendProcess;
  stopBackend();
  killProcessTree(engine);
  // 3) 结束本机所有 ComfyUI 引擎进程（含接管/外置的 Comfy Desktop 实例），释放被占用的显存
  setBackendMessage("正在结束本机所有 ComfyUI 引擎并释放显存…");
  killComfyEngines();
  try {
    stopTts();
  } catch {}
  try {
    stopIndexTts();
  } catch {}
  const { stopVisionReverse: stopVisionReverse2 } =
    await Promise.resolve().then(() => visionReverse);
  try {
    await stopVisionReverse2();
  } catch {}
  // 4) 稍候片刻，让系统回收显存
  await new Promise((resolve) => setTimeout(resolve, 900));
  setBackendMessage("显存已全部清理（ComfyUI 引擎已结束，需重新启动引擎再生成）");
}
const backend = /* @__PURE__ */ Object.freeze(
  /* @__PURE__ */ Object.defineProperty(
    {
      __proto__: null,
      asReference,
      audioModelsDir,
      cancelSingleTask,
      createGeneration,
      createImageGeneration,
      detectedVramMode,
      flushTaskPersistence,
      getActivePythonPath,
      getBackendStatus,
      getRemoteBackendOrigin,
      getTtsEngineDir,
      inputDir,
      interruptGeneration,
      isRemoteMode,
      listTasks,
      outputDir,
      prepareLocalMode,
      recoverPersistedTasks,
      releaseLocalGenerationGpu,
      restartBackend,
      runCanvasImageTool,
      startBackend,
      stopBackend,
      unloadAllGpuMemory,
    },
    Symbol.toStringTag,
    { value: "Module" },
  ),
);
function extractChatText(value, structuredFallback = false) {
  if (typeof value === "string") return value;
  if (Array.isArray(value))
    return value
      .map((item) => extractChatText(item, structuredFallback))
      .filter(Boolean)
      .join("");
  if (!value || typeof value !== "object") return "";
  const record = value;
  for (const key of ["text", "output_text", "content", "value"]) {
    if (record[key] === value) continue;
    const text = extractChatText(record[key], structuredFallback);
    if (text) return text;
  }
  if (structuredFallback) {
    try {
      return JSON.stringify(value);
    } catch {
      return "";
    }
  }
  return "";
}
const PRESETS = [
  createPreset("soullens", "SoulLens", "https://soullens.org"),
  createPreset("t8star", "贞贞的 AI 工坊", "https://ai.t8star.org"),
  createPreset("fhl", "FHL AI Gateway", "https://www.fhl.mom"),
  createPreset(
    "runninghub-cn",
    "RunningHub 国内站",
    "https://www.runninghub.cn",
  ),
  createLocalPreset(
    "local-qwen38",
    "内置 Qwen3.8 27B",
    "http://127.0.0.1:8191",
    "/v1/models",
    "qwen3.8-27b",
  ),
  createLocalPreset(
    "local-ollama",
    "本地 Ollama",
    "http://127.0.0.1:11434",
    "/api/tags",
    "qwen3:8b",
  ),
  createLocalPreset(
    "local-lmstudio",
    "本地 LM Studio",
    "http://127.0.0.1:1234/v1",
    "/models",
    "qwen3-8b",
  ),
];
function createPreset(id, name, baseUrl) {
  return {
    id,
    name,
    baseUrl,
    protocol: "openai-compatible",
    modelsPath: "/v1/models",
    chatPath: "/v1/chat/completions",
    imagesPath: "/v1/images/generations",
    imageEditsPath: "/v1/images/edits",
    videosPath: "/seedance/v3/contents/generations/tasks",
    imageProtocol: "auto",
    enabled: true,
    encryptedApiKey: "",
  };
}
function createLocalPreset(id, name, baseUrl, modelsPath, defaultModel) {
  return {
    ...createPreset(id, name, baseUrl),
    modelsPath,
    local: true,
    defaultModels: [defaultModel],
    encryptedApiKey: "",
  };
}
function configFile() {
  const directory = node_path.join(
    electron.app.getPath("userData"),
    "provider-settings",
  );
  node_fs.mkdirSync(directory, { recursive: true });
  return node_path.join(directory, "providers.json");
}
function readStored$1() {
  const file = configFile();
  if (!node_fs.existsSync(file)) {
    node_fs.writeFileSync(file, JSON.stringify(PRESETS, null, 2), "utf8");
    return structuredClone(PRESETS);
  }
  try {
    const parsed = JSON.parse(node_fs.readFileSync(file, "utf8"));
    const known = new Map(parsed.map((item) => [item.id, item]));
    for (const preset of PRESETS)
      if (!known.has(preset.id)) parsed.push(preset);
    return parsed;
  } catch {
    return structuredClone(PRESETS);
  }
}
function writeStored(providers) {
  node_fs.writeFileSync(
    configFile(),
    JSON.stringify(providers, null, 2),
    "utf8",
  );
}
function encrypt$1(value) {
  if (!value) return "";
  if (electron.safeStorage.isEncryptionAvailable())
    return electron.safeStorage.encryptString(value).toString("base64");
  return Buffer.from(value, "utf8").toString("base64");
}
function decrypt$1(value) {
  if (!value) return "";
  try {
    const buffer = Buffer.from(value, "base64");
    if (electron.safeStorage.isEncryptionAvailable())
      return electron.safeStorage.decryptString(buffer);
    return buffer.toString("utf8");
  } catch {
    return "";
  }
}
function getProviderApiKey(id) {
  const provider = readStored$1().find((item) => item.id === id);
  return provider ? decrypt$1(provider.encryptedApiKey) : "";
}
function publicProvider(provider) {
  const key = decrypt$1(provider.encryptedApiKey);
  return {
    id: provider.id,
    name: provider.name,
    baseUrl: provider.baseUrl,
    protocol: provider.protocol,
    modelsPath: provider.modelsPath,
    chatPath: provider.chatPath,
    imagesPath: provider.imagesPath,
    imageEditsPath: provider.imageEditsPath,
    videosPath:
      provider.videosPath || "/seedance/v3/contents/generations/tasks",
    imageProtocol: provider.imageProtocol,
    enabled: provider.enabled,
    hasApiKey: Boolean(key) || Boolean(provider.local),
    apiKeyMasked: key ? `••••••••${key.slice(-4)}` : "",
    local: provider.local,
    defaultModels: provider.defaultModels,
  };
}
function listProviders() {
  return readStored$1().map(publicProvider);
}
function saveProvider(input) {
  const providers = readStored$1();
  const currentIndex = providers.findIndex((item) => item.id === input.id);
  const previous = currentIndex >= 0 ? providers[currentIndex] : void 0;
  if (String(input.id || "").startsWith("custom-") && !input.name.trim()) {
    throw new Error("自定义中转站必须填写名称");
  }
  const next = {
    id: input.id || node_crypto.randomUUID(),
    name: input.name.trim() || "自定义中转站",
    baseUrl: input.baseUrl.trim().replace(/\/+$/, ""),
    protocol: "openai-compatible",
    modelsPath: input.modelsPath || "/v1/models",
    chatPath: input.chatPath || "/v1/chat/completions",
    imagesPath: input.imagesPath || "/v1/images/generations",
    imageEditsPath: input.imageEditsPath || "/v1/images/edits",
    videosPath: input.videosPath || "/seedance/v3/contents/generations/tasks",
    imageProtocol: input.imageProtocol || "auto",
    enabled: input.enabled,
    encryptedApiKey: input.apiKey?.trim()
      ? encrypt$1(input.apiKey.trim())
      : previous?.encryptedApiKey || "",
    local: input.local ?? previous?.local,
    defaultModels: input.defaultModels ?? previous?.defaultModels,
  };
  if (currentIndex >= 0) providers[currentIndex] = next;
  else providers.push(next);
  writeStored(providers);
  return publicProvider(next);
}
function removeProvider(id) {
  writeStored(readStored$1().filter((item) => item.id !== id));
}
function getProvider(id) {
  const provider = readStored$1().find((item) => item.id === id);
  if (!provider) throw new Error("中转站配置不存在");
  const apiKey = decrypt$1(provider.encryptedApiKey);
  if (!apiKey && !provider.local)
    throw new Error(`请先为 ${provider.name} 填写 API Key`);
  return { provider, apiKey };
}
function endpoint(baseUrl, path) {
  const base2 = baseUrl.replace(/\/+$/, "");
  const suffix = path.startsWith("/") ? path : `/${path}`;
  if (base2.endsWith("/v1") && suffix.startsWith("/v1/"))
    return `${base2}${suffix.slice(3)}`;
  return `${base2}${suffix}`;
}
async function apiFetch(providerId, path, init) {
  const { provider, apiKey } = getProvider(providerId);
  const headers = new Headers(init?.headers);
  if (apiKey) headers.set("Authorization", `Bearer ${apiKey}`);
  if (!(init?.body instanceof FormData))
    headers.set("Content-Type", "application/json");
  const requestTimeout = path === provider.chatPath ? 6e5 : 18e4;
  const response = await fetch(endpoint(provider.baseUrl, path), {
    ...init,
    headers,
    signal: AbortSignal.timeout(requestTimeout),
  });
  if (!response.ok) {
    const raw = await response.text();
    let message2 = raw;
    let isHtml = false;
    try {
      const parsed = JSON.parse(raw);
      message2 = parsed.error?.message || parsed.message || raw;
    } catch {
      isHtml = /<html|<!doctype html|<title>/i.test(raw);
    }
    if (response.status === 451) {
      throw new Error(
        `${provider.name} 暂时拒绝此请求（451）：服务商因地区、合规或账号策略限制未开放该视频接口。请在贞贞工坊网页确认账号可直接运行该模型，或更换已开放该模型的中转站；这不是模型名称转换问题。`,
      );
    }
    if (isHtml) {
      if (response.status === 524) {
        throw new Error(
          `${provider.name} 请求超时（524）：模型推理超过 100 秒被 Cloudflare 断开。请换用无 100 秒限制的中转站，或在「设置-中转站」里联系服务商开通长连接`,
        );
      }
      if (
        response.status === 502 ||
        response.status === 503 ||
        response.status === 504
      ) {
        throw new Error(
          `${provider.name} 网关错误（${response.status}）：中转站暂时不可用，请稍后重试`,
        );
      }
      const titleMatch = raw.match(/<title>([^<]+)<\/title>/i);
      throw new Error(
        `${provider.name} 请求失败 (${response.status})：${titleMatch ? titleMatch[1].trim() : "服务器返回 HTML 错误页"}`,
      );
    }
    throw new Error(
      `${provider.name} 请求失败 (${response.status})：${String(message2).slice(0, 300)}`,
    );
  }
  return response;
}
async function discoverModels(providerId) {
  const { provider } = getProvider(providerId);
  let items = [];
  try {
    const response = await apiFetch(providerId, provider.modelsPath, {
      method: "GET",
    });
    const payload = await response.json();
    items = Array.isArray(payload)
      ? payload
      : payload.data || payload.models || payload.result?.data || [];
  } catch (error) {
    if (!provider.local) throw error;
  }
  const discovered = items
    .map((item) => (typeof item === "string" ? { id: item } : item))
    .filter((item) => item?.id || item?.name)
    .map((item) => ({
      id: item.id || item.name,
      ownedBy: item.owned_by || item.ownedBy,
      providerId,
    }));
  const defaults = (provider.defaultModels || []).map((id) => ({
    id,
    providerId,
  }));
  return [
    ...new Map(
      [...discovered, ...defaults].map((item) => [item.id, item]),
    ).values(),
  ].sort((a, b) => a.id.localeCompare(b.id));
}
function isParamRejected(message2) {
  return /enable_thinking|reasoning_effort|\breasoning\b|\bthinking\b|unknown (?:field|parameter)|unsupported (?:field|parameter|request)|extra inputs? (?:are )?not permitted|not supported, valid|valid levels|must be one of|is not a valid|不支持本次请求中的部分参数|不支持[^，。；\n]{0,12}参数|参数[^，。；\n]{0,8}不支持|参数(?:无效|不合法|不被支持)|无效参数|invalid parameter|does not support one or more request parameters/i.test(
    message2,
  );
}
function buildChatRequestBody(request, provider) {
  const body = {
    model: request.model,
    messages: request.messages,
    temperature: request.temperature ?? 0.7,
    // 用流式响应突破 Cloudflare 100 秒强制超时（524）
    // 流式连接只要持续收到 data chunk，Cloudflare 不会切断，能跑长输出任务（漫剧/长 JSON）
    stream: request.stream ?? true,
  };
  if (request.maxTokens && request.maxTokens > 0) {
    if (/(^|[\/:_-])(o1|o3|o4|gpt-5(?:\.|-|$))([\/:_-]|$)/i.test(request.model))
      body.max_completion_tokens = request.maxTokens;
    else body.max_tokens = request.maxTokens;
  }
  if (request.responseFormat) {
    body.response_format = request.responseFormat;
  }
  if (request.reasoningMode && request.reasoningMode !== "auto") {
    const modelId = request.model.toLowerCase();
    const wantsOff = request.reasoningMode === "off";
    const requestedEffort =
      request.reasoningMode === "medium"
        ? "medium"
        : wantsOff
          ? "none"
          : "minimal";
    if (/openrouter/i.test(provider.baseUrl)) {
      body.reasoning = { effort: requestedEffort, exclude: true };
    } else if (/qwen|qwq/.test(modelId)) {
      body.enable_thinking = !wantsOff;
    } else if (/deepseek|glm|kimi|moonshot/.test(modelId)) {
      body.thinking = wantsOff ? { type: "disabled" } : { type: "enabled" };
    } else if (/gemini/.test(modelId)) {
      body.reasoning_effort = wantsOff
        ? /2\.5.*flash/.test(modelId)
          ? "none"
          : "low"
        : requestedEffort === "medium"
          ? "medium"
          : "low";
    } else if (/(^|[\/:_-])(o1|o3|o4|gpt-5)([\/:_.-]|$)/i.test(modelId)) {
      body.reasoning_effort = requestedEffort === "medium" ? "medium" : "low";
      delete body.temperature;
    }
  }
  return body;
}
async function fetchChatResponse(request, provider) {
  const body = buildChatRequestBody(request, provider);
  try {
    return await apiFetch(request.providerId, provider.chatPath, {
      method: "POST",
      body: JSON.stringify(body),
    });
  } catch (reason) {
    const message2 = reason instanceof Error ? reason.message : String(reason);
    if (!isParamRejected(message2)) throw reason;
    const downgrades = [];
    if (
      body.enable_thinking !== void 0 ||
      body.thinking !== void 0 ||
      body.reasoning !== void 0 ||
      body.reasoning_effort !== void 0
    ) {
      downgrades.push(() => {
        delete body.enable_thinking;
        delete body.thinking;
        delete body.reasoning;
        delete body.reasoning_effort;
      });
    }
    if (body.max_completion_tokens !== void 0) {
      downgrades.push(() => {
        body.max_tokens = body.max_completion_tokens;
        delete body.max_completion_tokens;
      });
    }
    if (body.response_format !== void 0) {
      downgrades.push(() => {
        delete body.response_format;
      });
    }
    let lastReason = reason;
    for (const downgrade of downgrades) {
      downgrade();
      try {
        return await apiFetch(request.providerId, provider.chatPath, {
          method: "POST",
          body: JSON.stringify(body),
        });
      } catch (next) {
        lastReason = next;
        const nextMessage = next instanceof Error ? next.message : String(next);
        if (!isParamRejected(nextMessage)) throw next;
      }
    }
    throw lastReason instanceof Error
      ? lastReason
      : new Error(String(lastReason));
  }
}
async function parseChatStreamResponse(response, request) {
  let content = "";
  let model = request.model;
  let usage;
  let upstreamError = "";
  let finishReason = "";
  let rawPreview = "";
  let reasoningChars = 0;
  let refusal = "";
  const reader = response.body?.getReader();
  if (!reader) throw new Error("流式响应没有 body");
  const decoder = new TextDecoder();
  let buffer = "";
  const appendText = (value) => {
    content += extractChatText(value);
  };
  const consumePayload = (jsonStr) => {
    if (!jsonStr || jsonStr === "[DONE]") return;
    rawPreview = (rawPreview + jsonStr).slice(-1500);
    try {
      const chunk = JSON.parse(jsonStr);
      const choice = chunk.choices?.[0];
      appendText(choice?.delta?.content);
      appendText(choice?.message?.content);
      appendText(choice?.text);
      const reasoning =
        choice?.delta?.reasoning_content ??
        choice?.delta?.reasoning ??
        choice?.message?.reasoning_content ??
        chunk.reasoning_content;
      if (typeof reasoning === "string") reasoningChars += reasoning.length;
      else if (Array.isArray(reasoning))
        reasoningChars += JSON.stringify(reasoning).length;
      refusal =
        choice?.delta?.refusal ||
        choice?.message?.refusal ||
        chunk.refusal ||
        refusal;
      if (chunk.type === "response.output_text.delta") appendText(chunk.delta);
      appendText(chunk.output_text);
      if (chunk.type === "content_block_delta") appendText(chunk.delta?.text);
      appendText(chunk.content_block?.text);
      appendText(
        chunk.response?.output
          ?.flatMap((output) => output?.content || [])
          .map((part) => part?.text || part?.output_text || ""),
      );
      appendText(
        chunk.candidates?.[0]?.content?.parts?.map((part) => part?.text || ""),
      );
      if (chunk.model) model = chunk.model;
      finishReason =
        choice?.finish_reason || chunk.finish_reason || finishReason;
      const error = chunk.error || (chunk.type === "error" ? chunk : void 0);
      if (error)
        upstreamError =
          typeof error === "string"
            ? error
            : error.message ||
              error.error?.message ||
              JSON.stringify(error).slice(0, 500);
      if (chunk.usage)
        usage = {
          promptTokens: chunk.usage.prompt_tokens || chunk.usage.input_tokens,
          completionTokens:
            chunk.usage.completion_tokens || chunk.usage.output_tokens,
          totalTokens: chunk.usage.total_tokens,
        };
    } catch {}
  };
  const consumeLine = (line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith(":") || trimmed.startsWith("event:"))
      return;
    consumePayload(
      trimmed.startsWith("data:") ? trimmed.slice(5).trim() : trimmed,
    );
  };
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() || "";
    for (const line of lines) consumeLine(line);
  }
  buffer += decoder.decode();
  if (buffer.trim()) consumeLine(buffer);
  if (!content.trim()) {
    if (upstreamError) throw new Error(`中转站流式响应报错：${upstreamError}`);
    if (refusal)
      throw new Error(`模型拒绝生成正文：${String(refusal).slice(0, 400)}`);
    if (/content_filter|safety|blocked|moderation/i.test(finishReason)) {
      throw new Error(
        `模型内容安全过滤导致正文为空（finish_reason=${finishReason}）。请检查剧本中是否含服务商禁止的露骨色情、未成年人、极端暴力或其他敏感内容，或更换允许该题材的合规模型`,
      );
    }
    if (
      reasoningChars > 0 &&
      /length|max_tokens|max_output_tokens/i.test(finishReason)
    ) {
      throw new Error(
        `模型把输出额度全部用于内部推理（已收到约 ${reasoningChars} 字思考内容，finish_reason=${finishReason}），没有留下最终JSON正文。请改用非推理模型，或关闭模型的深度思考模式`,
      );
    }
    if (/length|max_tokens|max_output_tokens/i.test(finishReason)) {
      throw new Error(
        `模型输出额度耗尽但没有形成最终正文（finish_reason=${finishReason}）。请缩短本次剧本或改用更大输出额度的非推理模型`,
      );
    }
    const detail = [
      reasoningChars ? `仅收到约${reasoningChars}字推理内容` : "",
      finishReason ? `finish_reason=${finishReason}` : "",
      rawPreview ? `响应预览=${rawPreview.slice(0, 500)}` : "未收到有效数据行",
    ]
      .filter(Boolean)
      .join("；");
    throw new Error(`流式响应结束但没有收到任何文本内容（${detail}）`);
  }
  return { content, model, usage };
}
async function parseChatJsonResponse(response, request) {
  const payload = await response.json();
  const message2 = payload.choices?.[0]?.message;
  const content =
    extractChatText(message2?.content, true) ||
    extractChatText(payload.output_text, true) ||
    extractChatText(payload.content, true) ||
    extractChatText(
      payload.output?.flatMap((output) => output?.content || []),
      true,
    );
  if (!content) {
    const finishReason =
      payload.choices?.[0]?.finish_reason || payload.status || "";
    const reasoning =
      message2?.reasoning_content ||
      message2?.reasoning ||
      payload.reasoning_content ||
      "";
    const refusal = message2?.refusal || payload.refusal || payload.error;
    if (refusal)
      throw new Error(
        `模型拒绝生成正文：${typeof refusal === "string" ? refusal.slice(0, 400) : JSON.stringify(refusal).slice(0, 400)}`,
      );
    if (reasoning)
      throw new Error(
        `模型只返回了内部推理而没有最终正文（推理约 ${typeof reasoning === "string" ? reasoning.length : JSON.stringify(reasoning).length} 字，结束原因=${finishReason || "未知"}）。请改用非推理模型或关闭深度思考`,
      );
    const debug = JSON.stringify(payload).slice(0, 300);
    throw new Error(
      `中转站返回成功，但没有可显示的文本内容。响应预览：${debug}`,
    );
  }
  return {
    content,
    model: payload.model || request.model,
    usage: payload.usage
      ? {
          promptTokens:
            payload.usage.prompt_tokens || payload.usage.input_tokens,
          completionTokens:
            payload.usage.completion_tokens || payload.usage.output_tokens,
          totalTokens: payload.usage.total_tokens,
        }
      : void 0,
  };
}
async function sendChat(request) {
  const { provider } = getProvider(request.providerId);
  if (provider.id === "local-qwen38") {
    const { startVisionReverse: startVisionReverse2 } =
      await Promise.resolve().then(() => visionReverse);
    await startVisionReverse2();
  }
  const response = await fetchChatResponse(request, provider);
  const contentType = response.headers.get("content-type") || "";
  if (
    request.stream !== false &&
    (contentType.includes("text/event-stream") ||
      contentType.includes("application/x-ndjson"))
  ) {
    return parseChatStreamResponse(response, request);
  }
  return parseChatJsonResponse(response, request);
}
async function sendVisionChat(request) {
  const { provider } = getProvider(request.providerId);
  const content = [{ type: "text", text: request.prompt }];
  for (const path of request.imagePaths)
    content.push({
      type: "image_url",
      image_url: { url: await fileDataUrl(path) },
    });
  const response = await apiFetch(request.providerId, provider.chatPath, {
    method: "POST",
    body: JSON.stringify({
      model: request.model,
      messages: [{ role: "user", content }],
      temperature: 0.2,
      stream: false,
    }),
  });
  return parseChatJsonResponse(response, { model: request.model });
}
function chooseImageProtocol(request) {
  if (request.imageProtocol !== "auto") return request.imageProtocol;
  return /(banana|gemini.*image|image.*gemini)/i.test(request.model)
    ? "chat-completions"
    : "openai-images";
}
async function fileDataUrl(path) {
  const extension = node_path.extname(path).toLowerCase();
  const mime =
    extension === ".png"
      ? "image/png"
      : extension === ".webp"
        ? "image/webp"
        : extension === ".mp4"
          ? "video/mp4"
          : extension === ".mov"
            ? "video/quicktime"
            : extension === ".webm"
              ? "video/webm"
              : extension === ".wav"
                ? "audio/wav"
                : extension === ".flac"
                  ? "audio/flac"
                  : extension === ".m4a"
                    ? "audio/mp4"
                    : extension === ".mp3"
                      ? "audio/mpeg"
                      : "image/jpeg";
  return `data:${mime};base64,${(await promises.readFile(path)).toString("base64")}`;
}
async function uploadVideoReference(providerId, path) {
  const { provider } = getProvider(providerId);
  const form = new FormData();
  form.append(
    "file",
    new Blob([await promises.readFile(path)]),
    node_path.basename(path),
  );
  const response = await apiFetch(providerId, "/v1/files/upload", {
    method: "POST",
    body: form,
  });
  const payload = await response.json();
  const url = deepPick(payload, [
    "url",
    "file.url",
    "data.url",
    "data.file.url",
    "file.file_url",
    "file.fileUrl",
    "data.file_url",
    "data.fileUrl",
  ]);
  if (typeof url === "string" && /^(?:https?:|data:)/i.test(url)) return url;
  const fileId = deepPick(payload, [
    "file_id",
    "file.file_id",
    "data.file_id",
    "data.fileId",
  ]);
  if (fileId) return String(fileId);
  throw new Error(`${provider.name} 文件上传成功但没有返回媒体地址`);
}
async function requestOpenAiImage(request) {
  const { provider } = getProvider(request.providerId);
  const common = {
    model: request.model,
    prompt: request.prompt,
    n: 1,
    size: request.size,
    response_format: "b64_json",
    ...(request.quality !== "auto" ? { quality: request.quality } : {}),
    // Recraft 系列模型支持 vector_art 风格输出 SVG 矢量图
    ...(request.vectorArt && /recraft/i.test(request.model)
      ? { style: "vector_art" }
      : {}),
  };
  if (!request.references.length) {
    const response2 = await apiFetch(request.providerId, provider.imagesPath, {
      method: "POST",
      body: JSON.stringify(common),
    });
    return response2.json();
  }
  const form = new FormData();
  Object.entries(common).forEach(([key, value]) =>
    form.append(key, String(value)),
  );
  for (const reference of request.references) {
    form.append(
      "image",
      new Blob([await promises.readFile(reference.path)]),
      node_path.basename(reference.path),
    );
  }
  const response = await apiFetch(request.providerId, provider.imageEditsPath, {
    method: "POST",
    body: form,
  });
  return response.json();
}
async function requestChatImage(request) {
  const { provider } = getProvider(request.providerId);
  const content = [{ type: "text", text: request.prompt }];
  for (const reference of request.references) {
    content.push({
      type: "image_url",
      image_url: { url: await fileDataUrl(reference.path) },
    });
  }
  const response = await apiFetch(request.providerId, provider.chatPath, {
    method: "POST",
    body: JSON.stringify({
      model: request.model,
      messages: [{ role: "user", content }],
      modalities: ["text", "image"],
      stream: false,
    }),
  });
  return response.json();
}
function extractUpstreamImageError(payload) {
  const error = payload?.error;
  if (!error || typeof error !== "object") return null;
  const message2 = String(
    error.message || error.msg || error.detail || "",
  ).trim();
  const code = String(error.type || error.code || "").trim();
  const codeLower = code.toLowerCase();
  if (
    /content.?policy|safety|unsafe|moderation|敏感|安全/.test(codeLower) ||
    /unsafe|安全/i.test(message2)
  ) {
    return new Error(
      `模型内容审核未通过：${message2 || "生成的图片可能包含服务商禁止的内容"}。请修改提示词或更换参考图后重试${code ? `（错误码 ${code}）` : ""}`,
    );
  }
  return new Error(
    `图片生成被中转站拒绝：${message2 || code || "未知错误"}${code && !message2.includes(code) ? `（${code}）` : ""}`,
  );
}
function extractImage(payload) {
  const upstreamError = extractUpstreamImageError(payload);
  if (upstreamError) throw upstreamError;
  const direct = payload.data?.[0] || payload.images?.[0];
  if (direct?.b64_json || direct?.base64)
    return {
      data: direct.b64_json || direct.base64,
      revisedPrompt: direct.revised_prompt,
    };
  if (direct?.url)
    return { url: direct.url, revisedPrompt: direct.revised_prompt };
  const message2 = payload.choices?.[0]?.message;
  const image = message2?.images?.[0]?.image_url || message2?.images?.[0];
  if (image?.url || typeof image === "string")
    return { url: image.url || image };
  if (Array.isArray(message2?.content)) {
    const part = message2.content.find(
      (item) =>
        item.type === "image_url" ||
        item.type === "output_image" ||
        item.image_url ||
        item.data,
    );
    if (part?.data) return { data: part.data };
    const url = part?.image_url?.url || part?.image_url || part?.url;
    if (url) return { url };
  }
  const text =
    typeof message2?.content === "string"
      ? message2.content
      : payload.output_text || "";
  const dataMatch = text.match(/data:image\/[\w.+-]+;base64,[A-Za-z0-9+/=]+/);
  if (dataMatch) return { url: dataMatch[0] };
  const urlMatch = text.match(
    /https?:\/\/[^\s)"']+\.(?:png|jpe?g|webp)(?:\?[^\s)"']*)?/i,
  );
  if (urlMatch) return { url: urlMatch[0] };
  const deep = deepPick(payload, [
    "result.images.0.url",
    "result.b64",
    "result.data",
    "output.0",
    "image_url",
    "url",
    "b64_json",
    "data.0",
    "image",
  ]);
  if (
    typeof deep === "string" &&
    (deep.startsWith("http") || deep.startsWith("data:image/"))
  )
    return { url: deep };
  if (typeof deep === "string" && /^[A-Za-z0-9+/=]{100,}$/.test(deep))
    return { data: deep };
  const debug = JSON.stringify(payload).slice(0, 800);
  throw new Error(
    `图片接口返回成功，但没有找到图片数据（可在中转站设置中切换图片协议后重试）。响应预览：${debug}`,
  );
}
async function saveImageOutput(extracted, request) {
  let buffer;
  let extension = ".png";
  if (extracted.data) {
    buffer = Buffer.from(
      extracted.data.replace(/^data:image\/[^;]+;base64,/, ""),
      "base64",
    );
    if (request.vectorArt) extension = ".svg";
  } else if (extracted.url?.startsWith("data:image/")) {
    const match = extracted.url.match(/^data:image\/([^;]+);base64,(.+)$/);
    if (!match) throw new Error("中转站返回了无法解析的图片数据");
    extension = match[1].includes("jpeg")
      ? ".jpg"
      : match[1].includes("webp")
        ? ".webp"
        : match[1].includes("svg")
          ? ".svg"
          : ".png";
    buffer = Buffer.from(match[2], "base64");
  } else if (extracted.url) {
    const response = await fetch(extracted.url, {
      signal: AbortSignal.timeout(12e4),
    });
    if (!response.ok)
      throw new Error(`生成成功，但下载图片失败 (${response.status})`);
    const contentType = response.headers.get("content-type") || "";
    extension = contentType.includes("jpeg")
      ? ".jpg"
      : contentType.includes("webp")
        ? ".webp"
        : contentType.includes("svg") || /\.svg(\?|$)/i.test(extracted.url)
          ? ".svg"
          : ".png";
    buffer = Buffer.from(await response.arrayBuffer());
  } else {
    throw new Error("没有可保存的图片数据");
  }
  const date = /* @__PURE__ */ new Date().toISOString().slice(0, 10);
  const outputRoot = configuredOutputDir();
  if (!outputRoot) throw new Error("请先在存储设置中选择输出文件夹");
  // 工作台项目归档：请求可携带 projectSubdir(如「替换工作室/<项目id>」)，
  // 命中时把该项目的生成物写到 outputDir()/<projectSubdir>/，便于资源管理按
  // 项目分级浏览(每个项目目录只含本项目资源)。缺省保持原 CloudImages/<date>。
  const projectSubdir = String(request.projectSubdir || "").trim();
  const directory = projectSubdir
    ? node_path.join(outputRoot, projectSubdir)
    : node_path.join(outputRoot, "CloudImages", date);
  await promises.mkdir(directory, { recursive: true });
  const target = node_path.join(
    directory,
    `${Date.now()}-${request.model.replace(/[^\w.-]+/g, "_")}${extension}`,
  );
  await promises.writeFile(target, buffer);
  return target;
}
async function generateCloudImage(request) {
  if (!request.model) throw new Error("请选择图片模型");
  if (!request.prompt.trim()) throw new Error("请输入图片提示词");
  const protocol = chooseImageProtocol(request);
  const payload =
    protocol === "openai-images"
      ? await requestOpenAiImage(request)
      : await requestChatImage(request);
  const extracted = extractImage(payload);
  const outputPath = await saveImageOutput(extracted, request);
  return {
    id: node_crypto.randomUUID(),
    model: request.model,
    providerId: request.providerId,
    prompt: request.prompt,
    outputPath,
    outputUrl: node_url.pathToFileURL(outputPath).toString(),
    revisedPrompt: extracted.revisedPrompt,
    createdAt: /* @__PURE__ */ new Date().toISOString(),
  };
}
function deepPick(payload, paths) {
  for (const path of paths) {
    let value = payload;
    let found = true;
    for (const key of path.split(".")) {
      if (value == null) {
        found = false;
        break;
      }
      value = /^\d+$/.test(key) ? value[Number(key)] : value[key];
    }
    if (found && value !== void 0 && value !== null && value !== "")
      return value;
  }
  return void 0;
}
function videoTaskId(payload) {
  return String(
    deepPick(payload, [
      "task_id",
      "taskId",
      "id",
      "data.task_id",
      "data.taskId",
      "data.id",
      "result.task_id",
      "result.id",
      "output.task_id",
      "output.id",
    ]) || "",
  );
}
function videoStatus(payload) {
  return String(
    deepPick(payload, [
      "status",
      "data.status",
      "result.status",
      "output.status",
    ]) || "",
  ).toLowerCase();
}
function videoResultUrl(payload) {
  const value = deepPick(payload, [
    "metadata.url",
    "data.metadata.url",
    "result.metadata.url",
    "content.video_url",
    "content.videoUrl",
    "data.video_url",
    "data.videoUrl",
    "data.content.video_url",
    "data.content.videoUrl",
    "data.response.0",
    "data.output",
    "data.video.url",
    "output",
    "result.video.url",
    "result.video_url",
    "result.videoUrl",
    "video.url",
    "video_url",
    "videoUrl",
    "url",
  ]);
  if (typeof value === "string" && /^(?:https?:|data:)/i.test(value))
    return value;
  const results = deepPick(payload, [
    "results",
    "data.results",
    "content",
    "data.content",
  ]);
  if (Array.isArray(results)) {
    for (const item of results) {
      const candidate = deepPick(item, [
        "video_url.url",
        "video_url",
        "videoUrl",
        "url",
        "output.url",
      ]);
      if (
        typeof candidate === "string" &&
        /^(?:https?:|data:)/i.test(candidate)
      )
        return candidate;
    }
  }
  return "";
}
async function saveVideoOutput(url, request) {
  const response = await fetch(url, { signal: AbortSignal.timeout(3e5) });
  if (!response.ok)
    throw new Error(`视频生成成功，但下载结果失败 (${response.status})`);
  const outputRoot = configuredOutputDir();
  if (!outputRoot) throw new Error("请先在存储设置中选择输出文件夹");
  // 工作台项目归档：见 saveImageOutput 的同名说明。
  const projectSubdir = String(request.projectSubdir || "").trim();
  const directory = projectSubdir
    ? node_path.join(outputRoot, projectSubdir)
    : node_path.join(
        outputRoot,
        "CloudVideos",
        /* @__PURE__ */ new Date().toISOString().slice(0, 10),
      );
  node_fs.mkdirSync(directory, { recursive: true });
  const target = node_path.join(
    directory,
    `${Date.now()}-${request.model.replace(/[^\w.-]+/g, "_")}.mp4`,
  );
  node_fs.writeFileSync(target, Buffer.from(await response.arrayBuffer()));
  return target;
}
function sleepInterruptible(ms, signal) {
  if (!signal) return new Promise((resolve) => setTimeout(resolve, ms));
  return new Promise((resolve, reject) => {
    if (signal.aborted) {
      reject(
        signal.reason instanceof Error
          ? signal.reason
          : new Error("云端视频生成已取消"),
      );
      return;
    }
    const onAbort = () => {
      clearTimeout(timer);
      reject(
        signal.reason instanceof Error
          ? signal.reason
          : new Error("云端视频生成已取消"),
      );
    };
    const timer = setTimeout(() => {
      signal.removeEventListener("abort", onAbort);
      resolve();
    }, ms);
    signal.addEventListener("abort", onAbort, { once: true });
  });
}
async function generateCloudVideo(request, signal) {
  if (!request.model) throw new Error("请选择云端视频模型");
  if (!request.prompt.trim()) throw new Error("请输入视频提示词");
  const { provider } = getProvider(request.providerId);
  const model = request.model.trim();
  const isH3 =
    /(?:^|[-_ ])(?:mini)?max[-_ ]?h3|hailuo[-_ ]?h3|h3(?:[-_ ]|$)/i.test(model);
  const isV1Video = /grok|kling|可灵/i.test(model);
  let body;
  let createPaths;
  let queryPathForTask;
  if (isH3) {
    const refs = { image: [], video: [], audio: [] };
    for (const reference of request.references)
      refs[reference.kind].push(
        await uploadVideoReference(request.providerId, reference.path),
      );
    const h3Resolution = request.resolution === "1080p" ? "2K" : "768P";
    body = {
      model,
      prompt: request.prompt,
      seconds: String(request.duration),
      metadata: { resolution: h3Resolution, ratio: request.ratio },
    };
    if (refs.image.length) body.images = refs.image;
    if (refs.video.length) body.metadata.video_url = refs.video;
    if (refs.audio.length) body.metadata.audio_url = refs.audio;
    createPaths = ["/v1/video/generations"];
    queryPathForTask = (path, taskId2) =>
      `${path.replace(/\/$/, "")}/${taskId2}`;
  } else {
    const content = [{ type: "text", text: request.prompt }];
    for (const reference of request.references) {
      const url2 = await fileDataUrl(reference.path);
      if (reference.kind === "image")
        content.push({
          type: "image_url",
          image_url: { url: url2, role: "reference_image" },
        });
      if (reference.kind === "video")
        content.push({
          type: "video_url",
          video_url: { url: url2, role: "reference_video" },
        });
      if (reference.kind === "audio")
        content.push({
          type: "audio_url",
          audio_url: { url: url2, role: "reference_audio" },
        });
    }
    body = {
      model,
      content,
      prompt: request.prompt,
      duration: request.duration,
      ratio: request.ratio,
      resolution: request.resolution,
      generate_audio: true,
    };
    if (isV1Video && request.references.length) {
      const images = [];
      for (const reference of request.references.filter(
        (item) => item.kind === "image",
      ))
        images.push(
          await uploadVideoReference(request.providerId, reference.path),
        );
      body = {
        model,
        prompt: request.prompt,
        ratio: request.ratio,
        duration: request.duration,
        resolution: request.resolution,
        ...(images.length ? { images } : {}),
      };
    }
    createPaths = isV1Video
      ? ["/v1/videos", provider.videosPath || "", "/v2/videos/generations"]
      : [
          ...new Set(
            [
              provider.videosPath || "",
              "/seedance/v3/contents/generations/tasks",
              "/v2/videos/generations",
            ].filter(Boolean),
          ),
        ];
    queryPathForTask = (path, taskId2) =>
      `${path.replace(/\/$/, "")}/${taskId2}`;
  }
  let payload;
  let usedPath = createPaths[0];
  let lastError2;
  for (const path of createPaths) {
    try {
      const response = await apiFetch(request.providerId, path, {
        method: "POST",
        body: JSON.stringify(body),
        signal,
      });
      payload = await response.json();
      usedPath = path;
      break;
    } catch (error) {
      if (signal?.aborted) throw error;
      if (
        error instanceof Error &&
        /451|拒绝此请求|账号策略限制|合规/.test(error.message)
      )
        throw error;
      lastError2 = error;
    }
  }
  if (!payload)
    throw lastError2 instanceof Error
      ? lastError2
      : new Error("云端视频任务提交失败");
  let url = videoResultUrl(payload);
  const taskId = videoTaskId(payload);
  if (!url && !taskId)
    throw new Error(
      "云端视频接口没有返回任务 ID 或视频地址，请检查视频接口路径",
    );
  const queryBase = usedPath.replace(/\/$/, "");
  let consecutiveQueryErrors = 0;
  for (let attempt = 0; !url && attempt < 1440; attempt += 1) {
    await sleepInterruptible(5e3, signal);
    try {
      const response = await apiFetch(
        request.providerId,
        queryPathForTask(queryBase, taskId),
        { method: "GET", signal },
      );
      payload = await response.json();
      consecutiveQueryErrors = 0;
      url = videoResultUrl(payload);
      const status = videoStatus(payload);
      if (
        ["failed", "fail", "failure", "error", "cancelled"].includes(status)
      ) {
        const reason = deepPick(payload, [
          "content.error_message",
          "data.error_message",
          "fail_reason",
          "data.error",
          "error.message",
          "message",
        ]);
        throw new Error(String(reason || "云端视频生成失败"));
      }
    } catch (error) {
      if (signal?.aborted) throw error;
      if (
        error instanceof Error &&
        /生成失败|cancelled|failure/i.test(error.message)
      )
        throw error;
      consecutiveQueryErrors += 1;
      if (consecutiveQueryErrors >= 3) throw error;
    }
  }
  if (!url) throw new Error("云端视频任务等待超时或未返回视频地址");
  const outputPath = await saveVideoOutput(url, request);
  return {
    id: node_crypto.randomUUID(),
    model: request.model,
    providerId: request.providerId,
    prompt: request.prompt,
    outputPath,
    outputUrl: node_url.pathToFileURL(outputPath).toString(),
    createdAt: /* @__PURE__ */ new Date().toISOString(),
  };
}
async function saveAudioOutput(buffer, request, extension) {
  const outputRoot = configuredOutputDir();
  if (!outputRoot) throw new Error("请先在存储设置中选择输出文件夹");
  // 工作台项目归档：见 saveImageOutput 的同名说明。
  const projectSubdir = String(request.projectSubdir || "").trim();
  const directory = projectSubdir
    ? node_path.join(outputRoot, projectSubdir)
    : node_path.join(
        outputRoot,
        "CloudAudio",
        /* @__PURE__ */ new Date().toISOString().slice(0, 10),
      );
  await promises.mkdir(directory, { recursive: true });
  const target = node_path.join(
    directory,
    `${Date.now()}-${request.model.replace(/[^\w.-]+/g, "_")}${extension}`,
  );
  await promises.writeFile(target, buffer);
  return target;
}
async function generateCloudAudio(request) {
  if (!request.model) throw new Error("请选择语音模型");
  if (!request.input.trim()) throw new Error("请输入要合成的文本");
  const { provider, apiKey } = getProvider(request.providerId);
  const hasReferences = request.references.length > 0;
  const rawModel = request.model;
  const strippedModel = rawModel.replace(/^[^/]+\//, "");
  const headers = {
    Authorization: `Bearer ${apiKey}`,
    "Content-Type": "application/json",
  };
  if (hasReferences) {
    const refAudio = request.references[0];
    const audioDataUrl = fileDataUrl(refAudio.path);
    const cloneErrors = [];
    try {
      const cloneHeaders = { Authorization: `Bearer ${apiKey}` };
      const formData = new FormData();
      formData.append("purpose", "voice_clone");
      formData.append(
        "file",
        new Blob([node_fs.readFileSync(refAudio.path)]),
        node_path.basename(refAudio.path),
      );
      const uploadUrl = endpoint(provider.baseUrl, "/v1/files/upload");
      const uploadRes = await fetch(uploadUrl, {
        method: "POST",
        headers: cloneHeaders,
        body: formData,
        signal: AbortSignal.timeout(12e4),
      });
      if (uploadRes.ok) {
        const uploadData = await uploadRes.json();
        const fileId = uploadData?.file?.file_id || uploadData?.file_id;
        if (fileId) {
          const cloneBody = {
            model: strippedModel,
            file_id: fileId,
            text: request.input,
            accuracy: 0.7,
            need_noise_reduction: false,
            need_volume_normalization: false,
            aigc_watermark: false,
          };
          const cloneUrl = endpoint(provider.baseUrl, "/v1/voice_clone");
          const cloneRes = await fetch(cloneUrl, {
            method: "POST",
            headers,
            body: JSON.stringify(cloneBody),
            signal: AbortSignal.timeout(18e4),
          });
          if (cloneRes.ok) {
            const cloneData = await cloneRes.json();
            const hexAudio = cloneData?.data?.audio;
            let buffer2;
            if (hexAudio) {
              buffer2 = Buffer.from(hexAudio, "hex");
            } else {
              const url = String(
                deepPick(cloneData, [
                  "data.url",
                  "data.audio_url",
                  "url",
                  "audio_url",
                ]) || "",
              );
              if (!url) throw new Error("克隆返回无音频数据");
              const dl = await fetch(url, {
                signal: AbortSignal.timeout(18e4),
              });
              buffer2 = Buffer.from(await dl.arrayBuffer());
            }
            const outputPath2 = await saveAudioOutput(buffer2, request, ".mp3");
            return {
              id: node_crypto.randomUUID(),
              model: request.model,
              providerId: request.providerId,
              input: request.input,
              outputPath: outputPath2,
              outputUrl: node_url.pathToFileURL(outputPath2).toString(),
              createdAt: /* @__PURE__ */ new Date().toISOString(),
            };
          }
          const cloneRaw = await cloneRes.text().catch(() => "");
          cloneErrors.push(
            `[voice_clone] ${cloneRes.status}: ${cloneRaw.slice(0, 200)}`,
          );
        } else {
          cloneErrors.push("[files/upload] 返回无 file_id");
        }
      } else {
        const uploadRaw = await uploadRes.text().catch(() => "");
        cloneErrors.push(
          `[files/upload] ${uploadRes.status}: ${uploadRaw.slice(0, 150)}`,
        );
      }
    } catch (err) {
      cloneErrors.push(`[原生克隆] ${err?.message || String(err)}`);
    }
    try {
      const cloneBody2 = {
        model: strippedModel,
        text: request.input,
        audio: audioDataUrl,
        accuracy: 0.7,
      };
      const cloneUrl2 = endpoint(provider.baseUrl, "/v1/voice_clone");
      const cloneRes2 = await fetch(cloneUrl2, {
        method: "POST",
        headers,
        body: JSON.stringify(cloneBody2),
        signal: AbortSignal.timeout(18e4),
      });
      if (cloneRes2.ok) {
        const cloneData = await cloneRes2.json();
        const hexAudio = cloneData?.data?.audio;
        let buffer2;
        if (hexAudio) {
          buffer2 = Buffer.from(hexAudio, "hex");
        } else {
          const dlUrl = String(
            deepPick(cloneData, [
              "data.url",
              "data.audio_url",
              "url",
              "audio_url",
            ]) || "",
          );
          if (!dlUrl) {
            cloneErrors.push("[voice_clone(dataUrl)] 返回无音频");
            throw new Error("skip");
          }
          const dl = await fetch(dlUrl, { signal: AbortSignal.timeout(18e4) });
          buffer2 = Buffer.from(await dl.arrayBuffer());
        }
        const outputPath2 = await saveAudioOutput(buffer2, request, ".mp3");
        return {
          id: node_crypto.randomUUID(),
          model: request.model,
          providerId: request.providerId,
          input: request.input,
          outputPath: outputPath2,
          outputUrl: node_url.pathToFileURL(outputPath2).toString(),
          createdAt: /* @__PURE__ */ new Date().toISOString(),
        };
      }
      const raw2 = await cloneRes2.text().catch(() => "");
      cloneErrors.push(
        `[voice_clone(dataUrl)] ${cloneRes2.status}: ${raw2.slice(0, 150)}`,
      );
    } catch (err) {
      if (err?.message !== "skip")
        cloneErrors.push(
          `[voice_clone(dataUrl)] ${err?.message || String(err)}`,
        );
    }
    console.warn(
      `[generateCloudAudio] 声音克隆不支持，回退到预设音色: ${cloneErrors.join("; ")}`,
    );
  }
  const voiceId = request.voice || "male-qn-qingse";
  const baseBody = { input: request.input, voice: voiceId };
  const strategies = [
    {
      label: `stripped model (${strippedModel}) + url`,
      path: "/v1/audio/speech",
      body: { model: strippedModel, ...baseBody, output_format: "url" },
    },
    {
      label: `stripped model (${strippedModel}) default`,
      path: "/v1/audio/speech",
      body: { model: strippedModel, ...baseBody },
    },
    {
      label: `raw model (${rawModel}) + url`,
      path: "/v1/audio/speech",
      body: { model: rawModel, ...baseBody, output_format: "url" },
    },
  ];
  let response = null;
  const errors = [];
  for (const s of strategies) {
    const url = endpoint(provider.baseUrl, s.path);
    try {
      const res = await fetch(url, {
        method: "POST",
        headers,
        body: JSON.stringify(s.body),
        signal: AbortSignal.timeout(18e4),
      });
      if (res.ok) {
        response = res;
        break;
      }
      const raw = await res.text().catch(() => "");
      const isHtml = raw.trimStart().startsWith("<");
      const detail = isHtml
        ? `[${s.label}] → ${res.status} (HTML 页面，端点不存在)`
        : `[${s.label}] → ${res.status}: ${raw.slice(0, 200)}`;
      errors.push(detail);
    } catch (err) {
      errors.push(`[${s.label}] → 网络错误: ${err?.message || String(err)}`);
    }
  }
  if (!response) {
    throw new Error(`${provider.name} TTS 请求失败：
${errors.join("\n")}`);
  }
  const contentType = response.headers.get("content-type") || "";
  let buffer;
  let extension = ".mp3";
  if (contentType.startsWith("audio/")) {
    if (contentType.includes("wav")) extension = ".wav";
    else if (contentType.includes("mpeg")) extension = ".mp3";
    else if (contentType.includes("ogg")) extension = ".ogg";
    else if (contentType.includes("flac")) extension = ".flac";
    else if (contentType.includes("aac")) extension = ".aac";
    buffer = Buffer.from(await response.arrayBuffer());
  } else if (contentType.includes("application/json")) {
    const payload = await response.json();
    const url = String(
      deepPick(payload, [
        "data.url",
        "data.audio_url",
        "url",
        "audio_url",
        "output_url",
        "result.url",
      ]) || "",
    );
    if (!url) throw new Error("语音接口返回成功，但没有找到音频数据");
    const dl = await fetch(url, { signal: AbortSignal.timeout(18e4) });
    if (!dl.ok) throw new Error(`生成成功，但下载音频失败 (${dl.status})`);
    const dlType = dl.headers.get("content-type") || "";
    if (dlType.includes("wav")) extension = ".wav";
    else if (dlType.includes("ogg")) extension = ".ogg";
    else if (dlType.includes("flac")) extension = ".flac";
    buffer = Buffer.from(await dl.arrayBuffer());
  } else {
    buffer = Buffer.from(await response.arrayBuffer());
  }
  const outputPath = await saveAudioOutput(buffer, request, extension);
  return {
    id: node_crypto.randomUUID(),
    model: request.model,
    providerId: request.providerId,
    input: request.input,
    outputPath,
    outputUrl: node_url.pathToFileURL(outputPath).toString(),
    createdAt: /* @__PURE__ */ new Date().toISOString(),
  };
}
async function transcribeWhisper(request) {
  const formData = new FormData();
  formData.append("model", request.model || "whisper-1");
  formData.append(
    "file",
    new Blob([await promises.readFile(request.audioPath)]),
    node_path.basename(request.audioPath),
  );
  const format = request.responseFormat || "json";
  formData.append("response_format", format);
  if (request.language) formData.append("language", request.language);
  const response = await apiFetch(
    request.providerId,
    "/v1/audio/transcriptions",
    { method: "POST", body: formData },
  );
  const outputDir2 = node_path.join(
    configuredOutputDir(),
    "Whisper",
    /* @__PURE__ */ new Date().toISOString().slice(0, 10),
  );
  node_fs.mkdirSync(outputDir2, { recursive: true });
  const outputPath = node_path.join(
    outputDir2,
    `${Date.now()}-transcript.${format === "json" || format === "verbose_json" ? "json" : format === "text" ? "txt" : format}`,
  );
  let text;
  let segments;
  if (format === "json" || format === "verbose_json") {
    const payload = await response.json();
    text = payload.text || JSON.stringify(payload, null, 2);
    if (Array.isArray(payload.segments)) {
      segments = payload.segments
        .map((item) => ({
          start: Number(item.start) || 0,
          end: Number(item.end) || Number(item.start) || 0,
          text: String(item.text || "").trim(),
        }))
        .filter((item) => item.text && item.end > item.start);
    }
    node_fs.writeFileSync(
      outputPath,
      JSON.stringify(payload, null, 2),
      "utf-8",
    );
    return { text, format, outputPath, segments };
  }
  text = await response.text();
  node_fs.writeFileSync(outputPath, text, "utf-8");
  return { text, format, outputPath };
}
const IMAGE_FILTER = {
  name: "图片",
  extensions: ["png", "jpg", "jpeg", "webp", "bmp", "tif", "tiff", "avif"],
};
const VIDEO_EXTENSIONS = ["mp4", "mov", "mkv", "webm", "avi", "m4v"];
async function createCanvasThumbnail(request) {
  if (!node_fs.existsSync(request.file)) throw new Error("缩略图源文件不存在");
  const directory = node_path.join(
    electron.app.getPath("userData"),
    "cache",
    "canvas-thumbnails",
  );
  node_fs.mkdirSync(directory, { recursive: true });
  const width = Math.max(96, Math.min(640, Math.round(request.width)));
  const key = node_crypto
    .createHash("sha1")
    .update(`${request.file}|${width}`)
    .digest("hex");
  const output = node_path.join(directory, `${key}.webp`);
  if (!node_fs.existsSync(output)) {
    const extension = node_path
      .extname(request.file)
      .toLowerCase()
      .replace(".", "");
    if (VIDEO_EXTENSIONS.includes(extension)) {
      const thumbnail = await electron.nativeImage.createThumbnailFromPath(
        request.file,
        { width, height: Math.max(96, Math.round((width * 9) / 16)) },
      );
      if (thumbnail.isEmpty()) throw new Error("系统未能生成视频缩略图");
      await sharp(thumbnail.toPNG())
        .webp({ quality: 68, effort: 2 })
        .toFile(output);
    } else {
      await sharp(request.file)
        .rotate()
        .resize({ width, withoutEnlargement: true, fit: "inside" })
        .webp({ quality: 68, effort: 2 })
        .toFile(output);
    }
  }
  return node_url.pathToFileURL(output).toString();
}
function safeBase(filePath2) {
  return node_path
    .basename(filePath2, node_path.extname(filePath2))
    .replace(/[<>:"/\\|?*\u0000-\u001f]/g, "_");
}
async function findFfmpeg() {
  try {
    const runtime = await resolveRuntime();
    const ffResult = await new Promise((resolve) => {
      let stdout = "";
      const child = node_child_process.spawn(
        runtime.pythonPath,
        ["-c", "import imageio_ffmpeg; print(imageio_ffmpeg.get_ffmpeg_exe())"],
        { windowsHide: true, env: { ...process.env, PYTHONUTF8: "1" } },
      );
      child.stdout.on("data", (chunk) => {
        stdout += chunk.toString("utf8");
      });
      child.once("error", () => resolve(""));
      child.once("exit", () => resolve(stdout.trim()));
    });
    if (ffResult && node_fs.existsSync(ffResult)) return ffResult;
    const sitePackages = node_path.join(
      node_path.dirname(node_path.dirname(runtime.pythonPath)),
      "Lib",
      "site-packages",
    );
    const imageioDir = node_path.join(sitePackages, "imageio_ffmpeg");
    if (node_fs.existsSync(imageioDir)) {
      const scan = (dir) =>
        node_fs
          .readdirSync(dir, { withFileTypes: true })
          .flatMap((entry) =>
            entry.isDirectory()
              ? scan(node_path.join(dir, entry.name))
              : [node_path.join(dir, entry.name)],
          );
      const exe = scan(imageioDir).find(
        (f) =>
          /^ffmpeg.*\.exe$/i.test(node_path.basename(f)) &&
          node_fs.existsSync(f),
      );
      if (exe) return exe;
    }
  } catch {}
  return "ffmpeg";
}
function result(outputPaths, message2) {
  return { success: true, outputPaths, message: message2 };
}
function rsRunFfmpeg(ffmpegBin, args) {
  return new Promise((resolvePromise, reject) => {
    const child = node_child_process.spawn(ffmpegBin, args, {
      windowsHide: true,
    });
    let stderr = "";
    child.stderr.on("data", (chunk) => {
      stderr += chunk.toString("utf8");
    });
    child.once("error", reject);
    child.once("exit", (code) => {
      resolvePromise({ ok: code === 0, stderr });
    });
  });
}

/**
 * rs 通道使用的轻量 ffmpeg 定位(避免 findFfmpeg → resolveRuntime 的
 * 外置 ComfyUI 依赖与耗时检查):环境变量 FFMPEG_PATH → 系统 PATH。
 */
function rsFfmpeg() {
  const configured = String(process.env.FFMPEG_PATH || "").trim();
  return configured || "ffmpeg";
}
/** ffprobe 定位(与 rsFfmpeg 同源:FFMPEG_PATH 目录下的 ffprobe,否则走 PATH)。 */
function rsFfprobe() {
  const configured = String(process.env.FFMPEG_PATH || "").trim();
  if (configured && node_fs.existsSync(configured)) {
    const dir = node_path.dirname(configured);
    const probe = node_path.join(dir, "ffprobe.exe");
    if (node_fs.existsSync(probe)) return probe;
  }
  return "ffprobe";
}
/** 用 ffprobe 取媒体时长(秒);失败返回 0。 */
async function probeDuration(filePath) {
  return new Promise((resolveResult) => {
    try {
      const child = node_child_process.spawn(rsFfprobe(), [
        "-v",
        "error",
        "-show_entries",
        "format=duration",
        "-of",
        "default=noprint_wrappers=1:nokey=1",
        filePath,
      ], { windowsHide: true });
      let stdout = "";
      child.stdout.on("data", (chunk) => {
        stdout += chunk.toString("utf8");
      });
      child.once("error", () => resolveResult(0));
      child.once("exit", () => {
        const value = Number.parseFloat(stdout.trim());
        resolveResult(Number.isFinite(value) ? value : 0);
      });
    } catch {
      resolveResult(0);
    }
  });
}
function uniqueOutput(directory, desiredName) {
  const extension = node_path.extname(desiredName);
  const stem = node_path.basename(desiredName, extension);
  let candidate = node_path.join(directory, desiredName);
  let index = 1;
  while (node_fs.existsSync(candidate)) {
    candidate = node_path.join(directory, `${stem}_${index}${extension}`);
    index += 1;
  }
  return candidate;
}
async function pickUtilityImages(multiple = true) {
  const lastDir = (() => {
    try {
      return (
        node_fs
          .readFileSync(
            node_path.join(
              electron.app.getPath("userData"),
              "last-pick-dir.txt",
            ),
            "utf8",
          )
          .trim() || void 0
      );
    } catch {
      return void 0;
    }
  })();
  const picked = await electron.dialog.showOpenDialog({
    title: "选择图片",
    defaultPath: lastDir,
    properties: multiple ? ["openFile", "multiSelections"] : ["openFile"],
    filters: [IMAGE_FILTER],
  });
  if (picked.canceled || !picked.filePaths.length) return [];
  try {
    node_fs.writeFileSync(
      node_path.join(electron.app.getPath("userData"), "last-pick-dir.txt"),
      node_path.join(picked.filePaths[0], ".."),
    );
  } catch {}
  return picked.filePaths.map((filePath2) => ({
    name: node_path.basename(filePath2),
    path: filePath2,
    url: node_url.pathToFileURL(filePath2).toString(),
    size: 0,
  }));
}
async function pickUtilityFiles() {
  const picked = await electron.dialog.showOpenDialog({
    title: "选择图片或 TXT 文件",
    properties: ["openFile", "multiSelections"],
    filters: [
      { name: "图片与文本", extensions: [...IMAGE_FILTER.extensions, "txt"] },
    ],
  });
  if (picked.canceled) return [];
  return picked.filePaths.map((filePath2) => ({
    name: node_path.basename(filePath2),
    path: filePath2,
    url: node_url.pathToFileURL(filePath2).toString(),
    size: 0,
  }));
}
async function pickUtilityVideo() {
  const picked = await electron.dialog.showOpenDialog({
    title: "选择一个或多个视频",
    properties: ["openFile", "multiSelections"],
    filters: [
      { name: "视频", extensions: ["mp4", "mov", "mkv", "webm", "avi"] },
    ],
  });
  if (picked.canceled) return [];
  return picked.filePaths.map((filePath2) => ({
    name: node_path.basename(filePath2),
    path: filePath2,
    url: node_url.pathToFileURL(filePath2).toString(),
    size: 0,
  }));
}
async function pickUtilityDirectory(defaultPath) {
  const picked = await electron.dialog.showOpenDialog({
    title: "选择输出文件夹",
    defaultPath: defaultPath || void 0,
    properties: ["openDirectory", "createDirectory"],
  });
  return picked.canceled ? "" : picked.filePaths[0];
}
async function pickImagesFromDirectory(defaultPath) {
  const picked = await electron.dialog.showOpenDialog({
    title: "选择图片文件夹",
    defaultPath: defaultPath || void 0,
    properties: ["openDirectory", "createDirectory"],
  });
  if (picked.canceled) return [];
  return imageFiles(picked.filePaths[0]).map((filePath2) => ({
    name: node_path.basename(filePath2),
    path: filePath2,
    url: node_url.pathToFileURL(filePath2).toString(),
    size: 0,
  }));
}
async function pickVideosFromDirectory(defaultPath) {
  const picked = await electron.dialog.showOpenDialog({
    title: "选择视频文件夹",
    defaultPath: defaultPath || void 0,
    properties: ["openDirectory", "createDirectory"],
  });
  if (picked.canceled) return [];
  const extensions = new Set(VIDEO_EXTENSIONS.map((item) => `.${item}`));
  return node_fs
    .readdirSync(picked.filePaths[0], { withFileTypes: true })
    .filter(
      (entry) =>
        entry.isFile() &&
        extensions.has(node_path.extname(entry.name).toLowerCase()),
    )
    .map((entry) => node_path.join(picked.filePaths[0], entry.name))
    .sort((a, b) => a.localeCompare(b, "zh-CN", { numeric: true }))
    .map((filePath2) => ({
      name: node_path.basename(filePath2),
      path: filePath2,
      url: node_url.pathToFileURL(filePath2).toString(),
      size: node_fs.statSync(filePath2).size,
    }));
}
async function convertImages(request) {
  node_fs.mkdirSync(request.outputDir, { recursive: true });
  const outputPaths = [];
  for (let index = 0; index < request.files.length; index += 1) {
    const source = request.files[index];
    const name = `${request.prefix || safeBase(source)}${request.prefix ? String(index + 1).padStart(3, "0") : ""}.${request.format}`;
    const outputPath = node_path.join(request.outputDir, name);
    let pipeline = sharp(source).rotate();
    if (request.format === "png")
      pipeline = pipeline.png({ compressionLevel: 8 });
    if (request.format === "jpg")
      pipeline = pipeline.jpeg({ quality: request.quality, mozjpeg: true });
    if (request.format === "webp")
      pipeline = pipeline.webp({ quality: request.quality });
    if (request.format === "avif")
      pipeline = pipeline.avif({ quality: request.quality });
    await pipeline.toFile(outputPath);
    outputPaths.push(outputPath);
  }
  return result(outputPaths, `已转换 ${outputPaths.length} 张图片`);
}
async function batchRenameFiles(request) {
  node_fs.mkdirSync(request.outputDir, { recursive: true });
  const outputPaths = request.files.map((source, index) => {
    const number = String(Math.max(0, request.start) + index).padStart(
      Math.max(1, request.digits),
      "0",
    );
    const outputPath = uniqueOutput(
      request.outputDir,
      `${request.prefix}${number}${node_path.extname(source)}`,
    );
    node_fs.copyFileSync(source, outputPath);
    return outputPath;
  });
  return result(outputPaths, `已按序重命名并复制 ${outputPaths.length} 个文件`);
}
function imageFiles(directory) {
  const supported = /\.(?:png|jpe?g|webp|bmp|gif|tiff?|avif)$/i;
  return node_fs
    .readdirSync(directory, { withFileTypes: true })
    .filter((entry) => entry.isFile() && supported.test(entry.name))
    .map((entry) => node_path.join(directory, entry.name));
}
async function imageHash(filePath2) {
  return sharp(filePath2)
    .rotate()
    .resize(8, 8, { fit: "fill" })
    .grayscale()
    .raw()
    .toBuffer();
}
function imageSimilarity(first, second) {
  if (first.length !== second.length) return 0;
  let difference = 0;
  for (let index = 0; index < first.length; index += 1)
    difference += Math.abs(first[index] - second[index]);
  return Math.round((1 - difference / (255 * first.length)) * 100);
}
async function renameBySimilarity(request) {
  node_fs.mkdirSync(request.outputDir, { recursive: true });
  const sources = await Promise.all(
    imageFiles(request.sourceDir).map(async (path) => ({
      path,
      hash: await imageHash(path),
    })),
  );
  const targets = await Promise.all(
    imageFiles(request.targetDir).map(async (path) => ({
      path,
      hash: await imageHash(path),
    })),
  );
  if (!sources.length || !targets.length)
    throw new Error("两个文件夹都需要包含可读取的图片");
  const outputPaths = [];
  let unmatched = 0;
  for (const target of targets) {
    let best;
    for (const source of sources) {
      const score = imageSimilarity(source.hash, target.hash);
      if (!best || score > best.score) best = { path: source.path, score };
    }
    if (!best || best.score < request.threshold) {
      unmatched += 1;
      continue;
    }
    const outputPath = uniqueOutput(
      request.outputDir,
      `${safeBase(best.path)}${node_path.extname(target.path)}`,
    );
    node_fs.copyFileSync(target.path, outputPath);
    outputPaths.push(outputPath);
  }
  return result(
    outputPaths,
    `相似度匹配完成：成功 ${outputPaths.length} 张，未达到阈值 ${unmatched} 张`,
  );
}
async function processTxtPairs(request) {
  const images = imageFiles(request.directory);
  if (!images.length) throw new Error("所选文件夹中没有图片");
  const outputPaths = [];
  for (const imagePath of images) {
    const txtPath = node_path.join(
      request.directory,
      `${safeBase(imagePath)}.txt`,
    );
    const existing = node_fs.existsSync(txtPath)
      ? node_fs.readFileSync(txtPath, "utf8")
      : "";
    let next = existing;
    if (request.action === "overwrite") next = request.content || "";
    if (request.action === "prefix-suffix")
      next = `${request.prefix || ""}${existing}${request.suffix || ""}`;
    if (request.action === "replace") {
      if (!request.search) throw new Error("请输入需要查找的文本");
      const escaped = request.search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      next = existing.replace(
        new RegExp(escaped, request.caseSensitive ? "g" : "gi"),
        request.replacement || "",
      );
    }
    node_fs.writeFileSync(txtPath, next, "utf8");
    outputPaths.push(txtPath);
  }
  return result(
    outputPaths,
    `已处理 ${outputPaths.length} 个图片同名 TXT 文件`,
  );
}
async function splitImages(request) {
  node_fs.mkdirSync(request.outputDir, { recursive: true });
  const outputPaths = [];
  let srcWidth = 0,
    srcHeight = 0;
  for (const source of request.files) {
    const rotatedBuffer = await sharp(source).rotate().toBuffer();
    const metadata = await sharp(rotatedBuffer).metadata();
    if (!metadata.width || !metadata.height)
      throw new Error(`无法读取图片尺寸：${node_path.basename(source)}`);
    srcWidth = metadata.width;
    srcHeight = metadata.height;
    const cellWidth = Math.floor(metadata.width / request.cols);
    const cellHeight = Math.floor(metadata.height / request.rows);
    const indexFilter = Array.isArray(request.indexes)
      ? new Set(request.indexes.map((item) => Number(item)))
      : null;
    for (let row = 0; row < request.rows; row += 1) {
      for (let col = 0; col < request.cols; col += 1) {
        const cellIndex = row * request.cols + col;
        if (indexFilter && !indexFilter.has(cellIndex)) continue;
        const left = col * cellWidth;
        const top = row * cellHeight;
        const width =
          col === request.cols - 1 ? metadata.width - left : cellWidth;
        const height =
          row === request.rows - 1 ? metadata.height - top : cellHeight;
        const outputPath = node_path.join(
          request.outputDir,
          `${safeBase(source)}_r${row + 1}c${col + 1}.${request.format}`,
        );
        let pipeline = sharp(rotatedBuffer).extract({
          left,
          top,
          width,
          height,
        });
        if (request.format === "png")
          pipeline = pipeline.png({ compressionLevel: 8 });
        if (request.format === "jpg")
          pipeline = pipeline.jpeg({ quality: 96, mozjpeg: true });
        if (request.format === "webp")
          pipeline = pipeline.webp({ quality: 96 });
        await pipeline.toFile(outputPath);
        outputPaths.push(outputPath);
      }
    }
  }
  return {
    success: true,
    outputPaths,
    message: `已输出 ${outputPaths.length} 个分割图块`,
    width: srcWidth,
    height: srcHeight,
  };
}
async function sliceImage(request) {
  if (!request.regions?.length)
    throw new Error("请先在图片上框选至少一个切片区域");
  node_fs.mkdirSync(request.outputDir, { recursive: true });
  const rotatedBuffer = await sharp(request.file).rotate().toBuffer();
  const metadata = await sharp(rotatedBuffer).metadata();
  if (!metadata.width || !metadata.height)
    throw new Error(`无法读取图片尺寸：${node_path.basename(request.file)}`);
  const units = [];
  const groupIndex = /* @__PURE__ */ new Map();
  request.regions.forEach((region, index) => {
    if (region.group !== void 0) {
      const existing = groupIndex.get(region.group);
      if (existing !== void 0) {
        units[existing].regions.push(region);
        return;
      }
      groupIndex.set(region.group, units.length);
      units.push({ key: index, regions: [region] });
    } else {
      units.push({ key: index, regions: [region] });
    }
  });
  const px = (region) => ({
    left: Math.max(
      0,
      Math.min(metadata.width - 2, Math.round(region.x * metadata.width)),
    ),
    top: Math.max(
      0,
      Math.min(metadata.height - 2, Math.round(region.y * metadata.height)),
    ),
    width: Math.max(
      2,
      Math.min(metadata.width, Math.round(region.width * metadata.width)),
    ),
    height: Math.max(
      2,
      Math.min(metadata.height, Math.round(region.height * metadata.height)),
    ),
  });
  const outputPaths = [];
  for (let unitIndex = 0; unitIndex < units.length; unitIndex += 1) {
    const unit = units[unitIndex];
    const outputPath = node_path.join(
      request.outputDir,
      `${safeBase(request.file)}_slice${unitIndex + 1}.${request.format}`,
    );
    if (unit.regions.length === 1) {
      const area = px(unit.regions[0]);
      let pipeline = sharp(rotatedBuffer).extract(area);
      if (request.format === "png")
        pipeline = pipeline.png({ compressionLevel: 8 });
      if (request.format === "jpg")
        pipeline = pipeline
          .flatten({ background: "#ffffff" })
          .jpeg({ quality: 96, mozjpeg: true });
      if (request.format === "webp") pipeline = pipeline.webp({ quality: 96 });
      await pipeline.toFile(outputPath);
    } else {
      const boxes = unit.regions.map(px);
      const minX = Math.min(...boxes.map((b) => b.left));
      const minY = Math.min(...boxes.map((b) => b.top));
      const maxX = Math.max(...boxes.map((b) => b.left + b.width));
      const maxY = Math.max(...boxes.map((b) => b.top + b.height));
      const canvasW = Math.max(2, maxX - minX);
      const canvasH = Math.max(2, maxY - minY);
      const composites = [];
      for (let i = 0; i < boxes.length; i += 1) {
        const buf = await sharp(rotatedBuffer)
          .extract(boxes[i])
          .png()
          .toBuffer();
        composites.push({
          input: buf,
          left: boxes[i].left - minX,
          top: boxes[i].top - minY,
        });
      }
      await sharp({
        create: {
          width: canvasW,
          height: canvasH,
          channels: 4,
          background: { r: 0, g: 0, b: 0, alpha: 0 },
        },
      })
        .composite(composites)
        .png({ compressionLevel: 8 })
        .toFile(outputPath);
    }
    outputPaths.push(outputPath);
  }
  return {
    success: true,
    outputPaths,
    message: `已切出 ${outputPaths.length} 个图片块`,
    width: metadata.width,
    height: metadata.height,
  };
}
async function stitchImages(request) {
  node_fs.mkdirSync(request.outputDir, { recursive: true });
  const firstSource = await sharp(request.first).rotate().toBuffer();
  const originalSecond = await sharp(request.second).rotate().toBuffer();
  const firstMeta = await sharp(firstSource).metadata();
  const secondMeta = await sharp(originalSecond).metadata();
  if (
    !firstMeta.width ||
    !firstMeta.height ||
    !secondMeta.width ||
    !secondMeta.height
  )
    throw new Error("无法读取对比图片尺寸");
  let secondSource = originalSecond;
  if (request.cropSecond === "auto") {
    secondSource = await sharp(originalSecond)
      .resize(firstMeta.width, firstMeta.height, {
        fit: "cover",
        position: "centre",
      })
      .toBuffer();
  } else if (request.cropSecond === "manual" && request.cropRegion) {
    const region = request.cropRegion;
    const left = Math.max(
      0,
      Math.min(secondMeta.width - 1, Math.round(region.x * secondMeta.width)),
    );
    const top = Math.max(
      0,
      Math.min(secondMeta.height - 1, Math.round(region.y * secondMeta.height)),
    );
    const width2 = Math.max(
      2,
      Math.min(
        secondMeta.width - left,
        Math.round(region.width * secondMeta.width),
      ),
    );
    const height2 = Math.max(
      2,
      Math.min(
        secondMeta.height - top,
        Math.round(region.height * secondMeta.height),
      ),
    );
    secondSource = await sharp(originalSecond)
      .extract({ left, top, width: width2, height: height2 })
      .toBuffer();
  }
  const effectiveSecondMeta = await sharp(secondSource).metadata();
  const horizontal = request.direction === "horizontal";
  const target = horizontal
    ? Math.max(firstMeta.height, effectiveSecondMeta.height || 0)
    : Math.max(firstMeta.width, effectiveSecondMeta.width || 0);
  const firstBuffer = await sharp(firstSource)
    .resize(horizontal ? void 0 : target, horizontal ? target : void 0, {
      fit: "inside",
    })
    .toBuffer();
  const secondBuffer = await sharp(secondSource)
    .resize(horizontal ? void 0 : target, horizontal ? target : void 0, {
      fit: "inside",
    })
    .toBuffer();
  const firstSized = await sharp(firstBuffer).metadata();
  const secondSized = await sharp(secondBuffer).metadata();
  const width = horizontal
    ? (firstSized.width || 0) + (secondSized.width || 0)
    : target;
  const height = horizontal
    ? target
    : (firstSized.height || 0) + (secondSized.height || 0);
  const canvas = sharp({
    create: {
      width,
      height,
      channels: 4,
      background: { r: 18, g: 20, b: 28, alpha: 1 },
    },
  }).composite([
    { input: firstBuffer, left: 0, top: 0 },
    {
      input: secondBuffer,
      left: horizontal ? firstSized.width || 0 : 0,
      top: horizontal ? 0 : firstSized.height || 0,
    },
  ]);
  const outputPath = node_path.join(
    request.outputDir,
    `${safeBase(request.first)}_VS_${safeBase(request.second)}.${request.format}`,
  );
  if (request.format === "png")
    await canvas.png({ compressionLevel: 8 }).toFile(outputPath);
  if (request.format === "jpg")
    await canvas.jpeg({ quality: 96, mozjpeg: true }).toFile(outputPath);
  if (request.format === "webp")
    await canvas.webp({ quality: 96 }).toFile(outputPath);
  return result([outputPath], "对比拼图已生成");
}
async function mosaicImages(request) {
  node_fs.mkdirSync(request.outputDir, { recursive: true });
  const runtime = await resolveRuntime();
  const configPath = node_path.join(
    electron.app.getPath("temp"),
    `yunhui-face-${node_crypto.randomUUID()}.json`,
  );
  node_fs.writeFileSync(configPath, JSON.stringify(request), "utf8");
  const scriptPath = node_path.join(
    runtime.toolDir,
    "face_mosaic.py",
  );
  const payload = await new Promise((resolvePromise, reject) => {
    const child = node_child_process.spawn(
      runtime.pythonPath,
      [scriptPath, configPath],
      {
        cwd: runtime.toolDir,
        windowsHide: true,
        env: { ...process.env, PYTHONUTF8: "1" },
      },
    );
    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (chunk) => {
      stdout += chunk.toString("utf8");
    });
    child.stderr.on("data", (chunk) => {
      stderr += chunk.toString("utf8");
    });
    child.once("error", reject);
    child.once("exit", (code) => {
      const line = stdout.trim().split(/\r?\n/).filter(Boolean).at(-1);
      try {
        const parsed = line ? JSON.parse(line) : void 0;
        if (code === 0 && parsed?.success) resolvePromise(parsed);
        else
          reject(
            new Error(
              parsed?.error ||
                stderr.trim() ||
                `人脸检测进程退出 (${code ?? "未知"})`,
            ),
          );
      } catch {
        reject(
          new Error(
            stderr.trim() || stdout.trim() || "人脸检测没有返回有效结果",
          ),
        );
      }
    });
  });
  const outputPaths = payload.outputPaths || [];
  return result(
    outputPaths,
    `已处理 ${outputPaths.length} 张图片，识别并遮挡 ${payload.faceCount || 0} 张人脸`,
  );
}
async function manualMosaicImage(request) {
  if (!request.regions.length)
    throw new Error("请先在图片上拖动框选需要马赛克的区域");
  node_fs.mkdirSync(request.outputDir, { recursive: true });
  const baseBuffer = await sharp(request.file).rotate().toBuffer();
  const metadata = await sharp(baseBuffer).metadata();
  if (!metadata.width || !metadata.height) throw new Error("无法读取图片尺寸");
  const overlays = [];
  for (const region of request.regions) {
    const left = Math.max(
      0,
      Math.min(metadata.width - 1, Math.round(region.x * metadata.width)),
    );
    const top = Math.max(
      0,
      Math.min(metadata.height - 1, Math.round(region.y * metadata.height)),
    );
    const width = Math.max(
      2,
      Math.min(
        metadata.width - left,
        Math.round(region.width * metadata.width),
      ),
    );
    const height = Math.max(
      2,
      Math.min(
        metadata.height - top,
        Math.round(region.height * metadata.height),
      ),
    );
    const tinyWidth = Math.max(1, Math.round(width / request.blockSize));
    const tinyHeight = Math.max(1, Math.round(height / request.blockSize));
    const input = await sharp(baseBuffer)
      .extract({ left, top, width, height })
      .resize(tinyWidth, tinyHeight, { kernel: sharp.kernel.nearest })
      .resize(width, height, { kernel: sharp.kernel.nearest })
      .toBuffer();
    overlays.push({ input, left, top });
  }
  const outputPath = node_path.join(
    request.outputDir,
    `${safeBase(request.file)}_manual_mosaic.png`,
  );
  await sharp(baseBuffer)
    .composite(overlays)
    .png({ compressionLevel: 8 })
    .toFile(outputPath);
  return result(
    [outputPath],
    `已保存手动马赛克，共处理 ${overlays.length} 个区域`,
  );
}
async function vectorizeImage(request) {
  if (!node_fs.existsSync(request.file)) throw new Error("找不到要转换的图片");
  node_fs.mkdirSync(request.outputDir, { recursive: true });
  const runtime = await resolveRuntime();
  const configPath = node_path.join(
    electron.app.getPath("temp"),
    `yunhui-vector-${node_crypto.randomUUID()}.json`,
  );
  node_fs.writeFileSync(configPath, JSON.stringify(request), "utf8");
  const scriptPath = node_path.join(
    runtime.toolDir,
    "vectorize.py",
  );
  const payload = await new Promise((resolvePromise, reject) => {
    const child = node_child_process.spawn(
      runtime.pythonPath,
      [scriptPath, configPath],
      {
        cwd: runtime.toolDir,
        windowsHide: true,
        env: { ...process.env, PYTHONUTF8: "1" },
      },
    );
    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (chunk) => {
      stdout += chunk.toString("utf8");
    });
    child.stderr.on("data", (chunk) => {
      stderr += chunk.toString("utf8");
    });
    child.once("error", reject);
    child.once("exit", (code) => {
      const line = stdout.trim().split(/\r?\n/).filter(Boolean).at(-1);
      try {
        const parsed = line ? JSON.parse(line) : void 0;
        if (code === 0 && parsed?.success) resolvePromise(parsed);
        else
          reject(
            new Error(
              parsed?.error ||
                stderr.trim() ||
                `矢量转换进程退出 (${code ?? "未知"})`,
            ),
          );
      } catch {
        reject(
          new Error(
            stderr.trim() || stdout.trim() || "矢量转换没有返回有效结果",
          ),
        );
      }
    });
  });
  const outputPaths = payload.outputPaths || [];
  return result(
    outputPaths,
    `已转换为 SVG 矢量图（${payload.layers || 0} 个颜色层）`,
  );
}
async function applyVideoMotion(request) {
  node_fs.mkdirSync(request.outputDir, { recursive: true });
  const runtime = await resolveRuntime();
  const configPath = node_path.join(
    electron.app.getPath("temp"),
    `yunhui-motion-${node_crypto.randomUUID()}.json`,
  );
  node_fs.writeFileSync(configPath, JSON.stringify(request), "utf8");
  const scriptPath = node_path.join(
    runtime.toolDir,
    "video_motion.py",
  );
  const payload = await new Promise((resolvePromise, reject) => {
    const child = node_child_process.spawn(
      runtime.pythonPath,
      [scriptPath, configPath],
      {
        cwd: runtime.toolDir,
        windowsHide: true,
        env: { ...process.env, PYTHONUTF8: "1" },
      },
    );
    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (chunk) => {
      stdout += chunk.toString("utf8");
    });
    child.stderr.on("data", (chunk) => {
      stderr += chunk.toString("utf8");
    });
    child.once("error", reject);
    child.once("exit", (code) => {
      const line = stdout.trim().split(/\r?\n/).filter(Boolean).at(-1);
      try {
        const parsed = line ? JSON.parse(line) : void 0;
        if (code === 0 && parsed?.success) resolvePromise(parsed);
        else
          reject(
            new Error(
              parsed?.error ||
                stderr.trim() ||
                `视频处理进程退出 (${code ?? "未知"})`,
            ),
          );
      } catch {
        reject(
          new Error(
            stderr.trim() || stdout.trim() || "视频处理没有返回有效结果",
          ),
        );
      }
    });
  });
  return result(
    payload.outputPaths || [],
    "视频运镜处理完成，已保留原视频音轨",
  );
}
async function cropCanvasImage(request) {
  node_fs.mkdirSync(request.outputDir, { recursive: true });
  const metadata = await sharp(request.file).rotate().metadata();
  if (!metadata.width || !metadata.height)
    throw new Error("无法读取待裁剪图片尺寸");
  const left = Math.max(
    0,
    Math.min(metadata.width - 1, Math.round(request.region.x * metadata.width)),
  );
  const top = Math.max(
    0,
    Math.min(
      metadata.height - 1,
      Math.round(request.region.y * metadata.height),
    ),
  );
  const width = Math.max(
    2,
    Math.min(
      metadata.width - left,
      Math.round(request.region.width * metadata.width),
    ),
  );
  const height = Math.max(
    2,
    Math.min(
      metadata.height - top,
      Math.round(request.region.height * metadata.height),
    ),
  );
  const outputPath = uniqueOutput(
    request.outputDir,
    `${safeBase(request.file)}_crop.png`,
  );
  await sharp(request.file)
    .rotate()
    .extract({ left, top, width, height })
    .png({ compressionLevel: 8 })
    .toFile(outputPath);
  return result([outputPath], `裁剪完成：${width} × ${height}`);
}
async function saveCanvasAnnotation(request) {
  node_fs.mkdirSync(request.outputDir, { recursive: true });
  const match = request.dataUrl.match(
    /^data:image\/(?:png|webp|jpeg);base64,(.+)$/i,
  );
  if (!match) throw new Error("批注图像数据无效");
  const outputPath = uniqueOutput(
    request.outputDir,
    `${safeBase(request.sourceName)}_annotated.png`,
  );
  await sharp(Buffer.from(match[1], "base64"))
    .png({ compressionLevel: 8 })
    .toFile(outputPath);
  return result([outputPath], "批注图片已保存");
}
async function runMediaTool(request, action) {
  node_fs.mkdirSync(request.outputDir, { recursive: true });
  const runtime = await resolveRuntime();
  const configPath = node_path.join(
    electron.app.getPath("temp"),
    `yunhui-media-${node_crypto.randomUUID()}.json`,
  );
  node_fs.writeFileSync(
    configPath,
    JSON.stringify({ ...request, action }),
    "utf8",
  );
  const scriptPath = node_path.join(
    runtime.toolDir,
    "media_tools.py",
  );
  const payload = await new Promise((resolvePromise, reject) => {
    const child = node_child_process.spawn(
      runtime.pythonPath,
      [scriptPath, configPath],
      {
        cwd: runtime.toolDir,
        windowsHide: true,
        env: { ...process.env, PYTHONUTF8: "1" },
      },
    );
    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (chunk) => {
      stdout += chunk.toString("utf8");
    });
    child.stderr.on("data", (chunk) => {
      stderr += chunk.toString("utf8");
    });
    child.once("error", reject);
    child.once("exit", (code) => {
      const line = stdout.trim().split(/\r?\n/).filter(Boolean).at(-1);
      try {
        const parsed = line ? JSON.parse(line) : void 0;
        if (code === 0 && parsed?.success) resolvePromise(parsed);
        else
          reject(
            new Error(
              parsed?.error ||
                stderr.trim() ||
                `媒体处理进程退出 (${code ?? "未知"})`,
            ),
          );
      } catch {
        reject(
          new Error(
            stderr.trim() || stdout.trim() || "媒体处理没有返回有效结果",
          ),
        );
      }
    });
  });
  return result(
    payload.outputPaths || [],
    payload.message ||
      (action === "upscale" ? "NVIDIA GPU 高清放大完成" : "音频分离完成"),
  );
}
function upscaleMedia(request) {
  return runMediaTool(request, "upscale");
}
function scanAudioLibrary(rootDir) {
  const AUDIO_EXT = /* @__PURE__ */ new Set([
    ".wav",
    ".mp3",
    ".flac",
    ".m4a",
    ".aac",
    ".ogg",
    ".opus",
  ]);
  const categories = [];
  const push = (category, path, name) => {
    let bucket = categories.find((item) => item.category === category);
    if (!bucket) {
      bucket = { category, files: [] };
      categories.push(bucket);
    }
    bucket.files.push({ path, name });
  };
  const walk = (dir, category) => {
    let entries;
    try {
      entries = node_fs
        .readdirSync(dir, { withFileTypes: true })
        .map((entry) => ({
          name: entry.name,
          isDirectory: () => entry.isDirectory(),
        }));
    } catch {
      return;
    }
    for (const entry of entries) {
      if (entry.name.startsWith(".")) continue;
      const full = node_path.join(dir, entry.name);
      if (entry.isDirectory()) walk(full, category);
      else if (AUDIO_EXT.has(node_path.extname(entry.name).toLowerCase()))
        push(category, full, entry.name);
    }
  };
  try {
    if (
      !rootDir ||
      !node_fs.existsSync(rootDir) ||
      !node_fs.statSync(rootDir).isDirectory()
    ) {
      return { ok: false, error: `目录不存在：${rootDir}`, categories };
    }
    for (const entry of node_fs.readdirSync(rootDir, { withFileTypes: true })) {
      if (entry.name.startsWith(".")) continue;
      const full = node_path.join(rootDir, entry.name);
      if (entry.isDirectory()) walk(full, entry.name);
      else if (AUDIO_EXT.has(node_path.extname(entry.name).toLowerCase()))
        push("未分类", full, entry.name);
    }
    for (const item of categories)
      item.files.sort((a, b) => a.name.localeCompare(b.name, "zh-Hans-CN"));
    categories.sort((a, b) =>
      a.category.localeCompare(b.category, "zh-Hans-CN"),
    );
    return { ok: true, error: "", categories };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : String(error),
      categories,
    };
  }
}
function downloadFilesToDesktop(files, folderName) {
  const valid = (files || []).filter(
    (file) => file && node_fs.existsSync(file),
  );
  if (!valid.length) throw new Error("没有可下载的文件");
  const desktop = electron.app.getPath("desktop");
  const stamp = `${/* @__PURE__ */ new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${/* @__PURE__ */ new Date().toTimeString().slice(0, 8).replace(/:/g, "")}`;
  const safeName =
    (folderName || "切片").replace(/[\\/:*?"<>|]/g, "_").slice(0, 60) || "切片";
  const target = node_path.join(desktop, `${safeName}-${stamp}`);
  node_fs.mkdirSync(target, { recursive: true });
  valid.forEach((file, index) => {
    const ext = node_path.extname(file) || ".png";
    const base2 = node_path.basename(file, ext).replace(/[\\/:*?"<>|]/g, "_");
    node_fs.copyFileSync(
      file,
      node_path.join(
        target,
        `${String(index + 1).padStart(2, "0")}-${base2}${ext}`,
      ),
    );
  });
  electron.shell.showItemInFolder(target);
  return { ok: true, folderPath: target, count: valid.length };
}
function extractVideoAudio(request) {
  return runMediaTool(request, "extract-audio");
}
async function trimAudio(request) {
  if (!node_fs.existsSync(request.sourcePath))
    throw new Error("音频源文件不存在");
  node_fs.mkdirSync(request.outputDir, { recursive: true });
  const extension = node_path.extname(request.sourcePath);
  const outputName = `${safeBase(request.sourcePath)}_trim_${request.startTime}-${request.endTime}${extension}`;
  const outputPath = uniqueOutput(request.outputDir, outputName);
  const duration = Math.max(0, request.endTime - request.startTime);
  const ffmpegBin = await findFfmpeg();
  await new Promise((resolvePromise, reject) => {
    const child = node_child_process.spawn(
      ffmpegBin,
      [
        "-y",
        "-ss",
        String(request.startTime),
        "-i",
        request.sourcePath,
        "-t",
        String(duration),
        "-c",
        "copy",
        outputPath,
      ],
      { windowsHide: true },
    );
    let stderr = "";
    child.stderr.on("data", (chunk) => {
      stderr += chunk.toString("utf8");
    });
    child.once("error", reject);
    child.once("exit", (code) => {
      if (code === 0) resolvePromise();
      else
        reject(
          new Error(stderr.trim() || `ffmpeg 进程退出 (${code ?? "未知"})`),
        );
    });
  });
  return result([outputPath], "音频裁剪完成");
}
async function mergeVideos(request) {
  if (!request.files || request.files.length < 2)
    throw new Error("至少需要 2 个视频文件");
  for (const f of request.files) {
    if (!node_fs.existsSync(f)) throw new Error(`视频文件不存在: ${f}`);
  }
  node_fs.mkdirSync(request.outputDir, { recursive: true });
  const ffmpegBin = await findFfmpeg();
  const outputPath = uniqueOutput(
    request.outputDir,
    `merged-${Date.now()}.mp4`,
  );
  const transition = request.transition || "none";
  const tDuration = Math.min(request.transitionDuration || 0.5, 2);
  if (transition === "crossfade" && request.files.length === 2) {
    const [a, b] = request.files;
    await new Promise((resolvePromise, reject) => {
      const probe2 = node_child_process.spawn(
        ffmpegBin,
        ["-i", a, "-f", "null", "-"],
        { windowsHide: true },
      );
      let probeStderr = "";
      probe2.stderr.on("data", (chunk) => {
        probeStderr += chunk.toString("utf8");
      });
      probe2.once("exit", () => {
        const durMatch = probeStderr.match(
          /Duration:\s*(\d+):(\d+):(\d+\.\d+)/,
        );
        const durationA = durMatch
          ? parseInt(durMatch[1]) * 3600 +
            parseInt(durMatch[2]) * 60 +
            parseFloat(durMatch[3])
          : 5;
        const offset = Math.max(0, durationA - tDuration);
        const child = node_child_process.spawn(
          ffmpegBin,
          [
            "-y",
            "-i",
            a,
            "-i",
            b,
            "-filter_complex",
            `[0:v][1:v]xfade=transition=fade:duration=${tDuration}:offset=${offset}[v];[0:a][1:a]acrossfade=d=${tDuration}[a]`,
            "-map",
            "[v]",
            "-map",
            "[a]",
            "-c:v",
            "libx264",
            "-preset",
            "fast",
            "-crf",
            "20",
            "-c:a",
            "aac",
            "-b:a",
            "128k",
            outputPath,
          ],
          { windowsHide: true },
        );
        let stderr = "";
        child.stderr.on("data", (chunk) => {
          stderr += chunk.toString("utf8");
        });
        child.once("error", reject);
        child.once("exit", (code) => {
          if (code === 0) resolvePromise();
          else
            reject(
              new Error(
                stderr.trim() || `ffmpeg 叠化合成失败 (${code ?? "未知"})`,
              ),
            );
        });
      });
    });
  } else {
    const listFile = node_path.join(
      request.outputDir,
      `concat-list-${Date.now()}.txt`,
    );
    const listContent = request.files
      .map((f) => `file '${f.replace(/'/g, "'\\''")}'`)
      .join("\n");
    node_fs.writeFileSync(listFile, listContent, "utf8");
    try {
      await new Promise((resolvePromise, reject) => {
        const child = node_child_process.spawn(
          ffmpegBin,
          [
            "-y",
            "-f",
            "concat",
            "-safe",
            "0",
            "-i",
            listFile,
            "-c",
            "copy",
            outputPath,
          ],
          { windowsHide: true },
        );
        let stderr = "";
        child.stderr.on("data", (chunk) => {
          stderr += chunk.toString("utf8");
        });
        child.once("error", reject);
        child.once("exit", (code) => {
          if (code === 0) resolvePromise();
          else {
            const child2 = node_child_process.spawn(
              ffmpegBin,
              [
                "-y",
                "-f",
                "concat",
                "-safe",
                "0",
                "-i",
                listFile,
                "-c:v",
                "libx264",
                "-preset",
                "fast",
                "-crf",
                "20",
                "-c:a",
                "aac",
                "-b:a",
                "128k",
                outputPath,
              ],
              { windowsHide: true },
            );
            let stderr2 = "";
            child2.stderr.on("data", (chunk) => {
              stderr2 += chunk.toString("utf8");
            });
            child2.once("error", reject);
            child2.once("exit", (code2) => {
              if (code2 === 0) resolvePromise();
              else
                reject(
                  new Error(
                    stderr2.trim() || `ffmpeg 拼接失败 (${code2 ?? "未知"})`,
                  ),
                );
            });
          }
        });
      });
    } finally {
      try {
        if (node_fs.existsSync(listFile))
          require("node:fs").unlinkSync(listFile);
      } catch {}
    }
  }
  return result(
    [outputPath],
    `视频拼合完成（${request.files.length} 段${transition === "crossfade" ? "，叠化转场" : ""}）`,
  );
}
async function probeDurationSeconds(ffmpegBin, file) {
  return new Promise((resolvePromise, reject) => {
    const probe2 = node_child_process.spawn(
      ffmpegBin,
      ["-i", file, "-f", "null", "-"],
      { windowsHide: true },
    );
    let stderr = "";
    probe2.stderr.on("data", (chunk) => {
      stderr += chunk.toString("utf8");
    });
    probe2.once("error", reject);
    probe2.once("exit", () => {
      const durMatch = stderr.match(/Duration:\s*(\d+):(\d+):(\d+\.\d+)/);
      if (!durMatch) {
        reject(new Error("无法读取视频时长"));
        return;
      }
      resolvePromise(
        parseInt(durMatch[1]) * 3600 +
          parseInt(durMatch[2]) * 60 +
          parseFloat(durMatch[3]),
      );
    });
  });
}
async function extractVideoFrame(request) {
  if (!request.file || !node_fs.existsSync(request.file))
    throw new Error("视频文件不存在");
  if (!/\.mp4$|\.webm$|\.mov$|\.mkv$|\.avi$/i.test(request.file))
    throw new Error("仅支持视频文件提取帧");
  node_fs.mkdirSync(request.outputDir, { recursive: true });
  const ffmpegBin = await findFfmpeg();
  const base2 = safeBase(request.file);
  const outputPath = uniqueOutput(
    request.outputDir,
    `${base2}-${request.position === "first" ? "首帧" : "尾帧"}.png`,
  );
  const runAttempt = (args) =>
    new Promise((resolvePromise, reject) => {
      if (node_fs.existsSync(outputPath)) {
        try {
          node_fs.unlinkSync(outputPath);
        } catch {}
      }
      const child = node_child_process.spawn(ffmpegBin, args, {
        windowsHide: true,
      });
      let stderr = "";
      child.stderr.on("data", (chunk) => {
        stderr += chunk.toString("utf8");
      });
      child.once("error", reject);
      child.once("exit", (code) => {
        const validOutput =
          code === 0 &&
          node_fs.existsSync(outputPath) &&
          node_fs.statSync(outputPath).size > 0;
        resolvePromise({ ok: validOutput, stderr });
      });
    });
  const attempts = [];
  if (request.position === "first") {
    attempts.push([
      "-y",
      "-i",
      request.file,
      "-map",
      "0:v:0",
      "-frames:v",
      "1",
      "-update",
      "1",
      outputPath,
    ]);
  } else {
    attempts.push([
      "-y",
      "-sseof",
      "-1",
      "-i",
      request.file,
      "-map",
      "0:v:0",
      "-vf",
      "reverse",
      "-frames:v",
      "1",
      "-update",
      "1",
      outputPath,
    ]);
    const duration = await probeDurationSeconds(ffmpegBin, request.file);
    for (const offset of [0.25, 0.75, 1.5]) {
      attempts.push([
        "-y",
        "-i",
        request.file,
        "-ss",
        String(Math.max(0, duration - offset)),
        "-map",
        "0:v:0",
        "-frames:v",
        "1",
        "-update",
        "1",
        outputPath,
      ]);
    }
  }
  let lastError2 = "";
  let extracted = false;
  for (const args of attempts) {
    const attempt = await runAttempt(args);
    if (attempt.ok) {
      extracted = true;
      break;
    }
    lastError2 = attempt.stderr;
  }
  if (!extracted) {
    const usefulError = lastError2.trim().split(/\r?\n/).slice(-12).join("\n");
    throw new Error(
      usefulError ||
        `ffmpeg 提取${request.position === "first" ? "首" : "尾"}帧失败`,
    );
  }
  return result(
    [outputPath],
    `已提取视频${request.position === "first" ? "首" : "尾"}帧`,
  );
}
let previousCpu = node_os
  .cpus()
  .map((cpu) => ({
    idle: cpu.times.idle,
    total: Object.values(cpu.times).reduce((sum, value) => sum + value, 0),
  }));
function cpuPercent() {
  const current = node_os.cpus();
  let idleDelta = 0;
  let totalDelta = 0;
  current.forEach((cpu, index) => {
    const total = Object.values(cpu.times).reduce(
      (sum, value) => sum + value,
      0,
    );
    const previous = previousCpu[index] || { idle: cpu.times.idle, total };
    idleDelta += cpu.times.idle - previous.idle;
    totalDelta += total - previous.total;
  });
  previousCpu = current.map((cpu) => ({
    idle: cpu.times.idle,
    total: Object.values(cpu.times).reduce((sum, value) => sum + value, 0),
  }));
  return totalDelta > 0
    ? Math.max(0, Math.min(100, Math.round((1 - idleDelta / totalDelta) * 100)))
    : 0;
}
function gpuUsage() {
  return new Promise((resolve) => {
    node_child_process.execFile(
      "nvidia-smi",
      [
        "--query-gpu=name,driver_version,utilization.gpu,memory.used,memory.total",
        "--format=csv,noheader,nounits",
      ],
      { windowsHide: true, timeout: 2500 },
      (error, stdout) => {
        if (error || !stdout.trim()) return resolve({});
        const [name, driverVersion, utilization, used, total] = stdout
          .trim()
          .split(/\r?\n/)[0]
          .split(",")
          .map((item) => item.trim());
        const vramUsedMb = Number(used);
        const vramTotalMb = Number(total);
        resolve({
          gpuName: name,
          driverVersion,
          gpuPercent: Number(utilization),
          vramUsedMb,
          vramTotalMb,
          vramPercent: vramTotalMb
            ? Math.round((vramUsedMb / vramTotalMb) * 100)
            : 0,
        });
      },
    );
  });
}
async function getSystemUsage() {
  const memoryTotal = node_os.totalmem();
  const memoryUsed = memoryTotal - node_os.freemem();
  return {
    cpuPercent: cpuPercent(),
    memoryUsedGb: Number((memoryUsed / 1024 ** 3).toFixed(1)),
    memoryTotalGb: Number((memoryTotal / 1024 ** 3).toFixed(1)),
    memoryPercent: Math.round((memoryUsed / memoryTotal) * 100),
    ...(await gpuUsage()),
  };
}
const CANVAS_PROJECTS_FILE = "canvas-projects.json";
const DRAMA_SESSION_FILE = "drama-session.json";
const BACKUP_DIR_NAME = "canvas-backups";
const BACKUP_KEEP = 24;
const TOMBSTONE_FILE = "canvas-tombstones.json";
const TOMBSTONE_TTL_MS = 7 * 24 * 60 * 60 * 1e3;
let canvasWriteChain = Promise.resolve();
let dramaWriteChain = Promise.resolve();
function tombstonePath() {
  return node_path.join(electron.app.getPath("userData"), TOMBSTONE_FILE);
}
function loadTombstones() {
  try {
    const value = JSON.parse(node_fs.readFileSync(tombstonePath(), "utf8"));
    return value && typeof value === "object" ? value : {};
  } catch {
    return {};
  }
}
function writeTombstones(tombstones) {
  try {
    node_fs.writeFileSync(tombstonePath(), JSON.stringify(tombstones), "utf8");
  } catch (error) {
    console.error("[canvasStorage] 墓碑写入失败", error);
  }
}
function isProjectTombstoned(projectId) {
  const tombstones = loadTombstones();
  const deletedAt = tombstones[projectId];
  if (!deletedAt) return false;
  if (Date.now() - deletedAt > TOMBSTONE_TTL_MS) {
    delete tombstones[projectId];
    writeTombstones(tombstones);
    return false;
  }
  return true;
}
function updateTombstonesOnSave(target, nextProjects) {
  try {
    const before = parseProjects(target);
    if (!before) return;
    const tombstones = loadTombstones();
    let changed = false;
    const afterIds = new Set(
      nextProjects
        .map((project) => project?.id)
        .filter((id) => typeof id === "string"),
    );
    for (const project of before) {
      const id = project?.id;
      if (
        typeof id === "string" &&
        id &&
        !afterIds.has(id) &&
        !tombstones[id]
      ) {
        tombstones[id] = Date.now();
        changed = true;
      }
    }
    for (const id of afterIds) {
      if (tombstones[id]) {
        delete tombstones[id];
        changed = true;
      }
    }
    for (const [id, deletedAt] of Object.entries(tombstones)) {
      if (Date.now() - deletedAt > TOMBSTONE_TTL_MS) {
        delete tombstones[id];
        changed = true;
      }
    }
    if (changed) writeTombstones(tombstones);
  } catch (error) {
    console.error("[canvasStorage] 墓碑更新失败", error);
  }
}
function archiveCurrentSnapshot(target) {
  try {
    if (!node_fs.existsSync(target)) return;
    const dir = node_path.join(node_path.dirname(target), BACKUP_DIR_NAME);
    node_fs.mkdirSync(dir, { recursive: true });
    const stamp = /* @__PURE__ */ new Date()
      .toISOString()
      .slice(0, 13)
      .replace(/[:T]/g, "-");
    const backupPath = node_path.join(
      dir,
      `${node_path.basename(target)}.${stamp}.json`,
    );
    if (!node_fs.existsSync(backupPath))
      node_fs.copyFileSync(target, backupPath);
    const entries = node_fs
      .readdirSync(dir)
      .filter(
        (name) =>
          name.startsWith(node_path.basename(target)) && name.endsWith(".json"),
      )
      .sort();
    for (const name of entries.slice(
      0,
      Math.max(0, entries.length - BACKUP_KEEP),
    )) {
      node_fs.rmSync(node_path.join(dir, name), { force: true });
    }
  } catch (error) {
    console.error("[canvasStorage] 画布备份存档失败", error);
  }
}
function enqueueWrite(previous, write) {
  return previous.catch(() => void 0).then(write);
}
function listCanvasBackups() {
  const dir = node_path.join(electron.app.getPath("userData"), BACKUP_DIR_NAME);
  if (!node_fs.existsSync(dir)) return [];
  return node_fs
    .readdirSync(dir)
    .filter(
      (name) =>
        name.startsWith(`${CANVAS_PROJECTS_FILE}.`) && name.endsWith(".json"),
    )
    .sort()
    .reverse()
    .map((name) => {
      const full = node_path.join(dir, name);
      let bytes = 0;
      try {
        bytes = node_fs.statSync(full).size;
      } catch {}
      return {
        file: name,
        stamp: name.slice(CANVAS_PROJECTS_FILE.length + 1, -".json".length),
        projects: parseProjects(full)?.length ?? 0,
        bytes,
      };
    });
}
function restoreCanvasBackup(fileName) {
  if (
    !new RegExp(
      `^${CANVAS_PROJECTS_FILE}\\.\\d{4}-\\d{2}-\\d{2}-\\d{2}\\.json$`,
    ).test(fileName)
  ) {
    throw new Error("备份文件名无效");
  }
  const dir = node_path.join(electron.app.getPath("userData"), BACKUP_DIR_NAME);
  const backupPath = node_path.join(dir, fileName);
  const projects = parseProjects(backupPath);
  if (!projects) throw new Error("备份文件损坏或不含有效项目");
  const target = storagePath();
  archiveCurrentSnapshot(target);
  node_fs.copyFileSync(backupPath, target);
  return { ok: true, projects: projects.length };
}
function listCanvasProjectSummaries() {
  return (loadCanvasProjects() || []).map((project) => {
    const item = project;
    return {
      id: typeof item.id === "string" ? item.id : "",
      name: typeof item.name === "string" ? item.name : "未命名",
      nodes: Array.isArray(item.nodes) ? item.nodes.length : 0,
      updatedAt: typeof item.updatedAt === "string" ? item.updatedAt : "",
    };
  });
}
function isProjectArray(value) {
  return (
    Array.isArray(value) &&
    value.length > 0 &&
    value.every((project) => {
      if (!project || typeof project !== "object") return false;
      const candidate = project;
      return (
        typeof candidate.id === "string" &&
        candidate.id.length > 0 &&
        Array.isArray(candidate.nodes)
      );
    })
  );
}
function storagePath() {
  return node_path.join(electron.app.getPath("userData"), CANVAS_PROJECTS_FILE);
}
function parseProjects(filePath2) {
  try {
    const value = JSON.parse(node_fs.readFileSync(filePath2, "utf8"));
    return isProjectArray(value) ? value : null;
  } catch {
    return null;
  }
}
function archiveCanvasSnapshotOnStartup() {
  archiveCurrentSnapshot(storagePath());
}
function loadCanvasProjects() {
  const target = storagePath();
  return parseProjects(target) || parseProjects(`${target}.bak`);
}
async function saveCanvasProjects(projects) {
  if (!isProjectArray(projects)) throw new Error("画布项目格式无效");
  const target = storagePath();
  const json2 = JSON.stringify(projects);
  canvasWriteChain = enqueueWrite(canvasWriteChain, () => {
    archiveCurrentSnapshot(target);
    updateTombstonesOnSave(target, projects);
    return writeJsonAtomically(target, json2, true);
  });
  await canvasWriteChain;
  return { ok: true, bytes: Buffer.byteLength(json2, "utf8"), path: target };
}
function projectIdOf(session) {
  if (!session || typeof session !== "object") return null;
  const projectId = session.projectId;
  return typeof projectId === "string" && projectId.length > 0
    ? projectId
    : null;
}
function parseDramaSnapshot(filePath2) {
  try {
    const value = JSON.parse(node_fs.readFileSync(filePath2, "utf8"));
    if (
      value &&
      typeof value === "object" &&
      value.__yuhDramaSessionStorage === 1 &&
      Number.isSafeInteger(value.revision) &&
      Number(value.revision) >= 0 &&
      typeof value.ownerProjectId === "string" &&
      Object.prototype.hasOwnProperty.call(value, "session")
    ) {
      const envelope = value;
      return {
        session: envelope.session,
        revision: envelope.revision,
        ownerProjectId: envelope.ownerProjectId,
      };
    }
    return { session: value, revision: 0, ownerProjectId: projectIdOf(value) };
  } catch {
    return null;
  }
}
function readDramaSnapshot(target) {
  return (
    parseDramaSnapshot(target) ??
    parseDramaSnapshot(`${target}.bak`) ?? {
      session: null,
      revision: 0,
      ownerProjectId: null,
    }
  );
}
function loadDramaSessionWithRevision() {
  const target = node_path.join(
    electron.app.getPath("userData"),
    DRAMA_SESSION_FILE,
  );
  const { session, revision } = readDramaSnapshot(target);
  return { session, revision };
}
function loadDramaSession() {
  return loadDramaSessionWithRevision().session;
}
async function flushCanvasStorage() {
  await Promise.allSettled([canvasWriteChain, dramaWriteChain]);
}
async function saveDramaSession(session) {
  const target = node_path.join(
    electron.app.getPath("userData"),
    DRAMA_SESSION_FILE,
  );
  if (session === null) {
    dramaWriteChain = enqueueWrite(dramaWriteChain, () =>
      promises.rm(target, { force: true }),
    );
    await dramaWriteChain;
    return { ok: true, bytes: 0, path: target };
  }
  const json2 = JSON.stringify(session);
  dramaWriteChain = enqueueWrite(dramaWriteChain, () =>
    writeJsonAtomically(target, json2, true),
  );
  await dramaWriteChain;
  return { ok: true, bytes: Buffer.byteLength(json2, "utf8"), path: target };
}
function dramaOwnerMismatch(current, request) {
  const candidateOwner = projectIdOf(request.session);
  const modeMismatch =
    (request.mode === "clear" && request.session !== null) ||
    (request.mode !== "clear" && request.session === null);
  return (
    !request.ownerProjectId ||
    modeMismatch ||
    (request.mode !== "replace" &&
      current.session !== null &&
      current.ownerProjectId !== null &&
      current.ownerProjectId !== request.ownerProjectId) ||
    (request.session !== null && candidateOwner !== request.ownerProjectId)
  );
}
async function saveDramaSessionCas(request) {
  const target = node_path.join(
    electron.app.getPath("userData"),
    DRAMA_SESSION_FILE,
  );
  let result2;
  dramaWriteChain = enqueueWrite(dramaWriteChain, async () => {
    const current = readDramaSnapshot(target);
    if (current.revision !== request.expectedRevision) {
      result2 = {
        ok: false,
        reason: "revision-conflict",
        revision: current.revision,
        path: target,
      };
      return;
    }
    if (dramaOwnerMismatch(current, request)) {
      result2 = {
        ok: false,
        reason: "owner-mismatch",
        revision: current.revision,
        path: target,
      };
      return;
    }
    const revision = current.revision + 1;
    const envelope = {
      __yuhDramaSessionStorage: 1,
      revision,
      ownerProjectId: request.ownerProjectId,
      session: request.session,
    };
    const json2 = JSON.stringify(envelope);
    await writeJsonAtomically(target, json2, true);
    result2 = {
      ok: true,
      revision,
      bytes: Buffer.byteLength(json2, "utf8"),
      path: target,
    };
  });
  await dramaWriteChain;
  if (!result2) throw new Error("漫剧会话 CAS 写入未返回结果");
  return result2;
}
const DATE_DIR = /^\d{4}-\d{2}-\d{2}$/;
function scanOutputStorage() {
  const root = outputDir();
  const groups = /* @__PURE__ */ new Map();
  let totalBytes = 0;
  if (node_fs.existsSync(root)) {
    for (const category of node_fs.readdirSync(root)) {
      const categoryDir = node_path.join(root, category);
      if (!node_fs.statSync(categoryDir).isDirectory()) continue;
      for (const day of node_fs.readdirSync(categoryDir)) {
        if (!DATE_DIR.test(day)) continue;
        const dayDir = node_path.join(categoryDir, day);
        let dayStat;
        try {
          dayStat = node_fs.statSync(dayDir);
        } catch {
          continue;
        }
        if (!dayStat.isDirectory()) continue;
        const month = day.slice(0, 7);
        const key = `${category}|${month}`;
        let files = 0;
        let bytes = 0;
        const walk = (dir) => {
          for (const name of node_fs.readdirSync(dir)) {
            const full = node_path.join(dir, name);
            let st;
            try {
              st = node_fs.statSync(full);
            } catch {
              continue;
            }
            if (st.isDirectory()) walk(full);
            else {
              files++;
              bytes += st.size;
            }
          }
        };
        walk(dayDir);
        const group = groups.get(key);
        if (group) {
          group.files += files;
          group.bytes += bytes;
        } else groups.set(key, { category, month, files, bytes });
        totalBytes += bytes;
      }
    }
  }
  return {
    root,
    totalBytes,
    groups: [...groups.values()].sort(
      (a, b) =>
        a.month.localeCompare(b.month) || a.category.localeCompare(b.category),
    ),
  };
}
async function trashOutputGroups(selection) {
  const root = outputDir();
  let trashed = 0;
  for (const { category, month } of selection) {
    if (
      !category ||
      category.includes("/") ||
      category.includes("\\") ||
      category.includes("..")
    )
      continue;
    if (!/^\d{4}-\d{2}$/.test(month)) continue;
    const categoryDir = node_path.join(root, category);
    if (!node_fs.existsSync(categoryDir)) continue;
    for (const day of node_fs.readdirSync(categoryDir)) {
      if (!DATE_DIR.test(day) || day.slice(0, 7) !== month) continue;
      const dayDir = node_path.join(categoryDir, day);
      try {
        await electron.shell.trashItem(dayDir);
        trashed++;
      } catch {}
    }
  }
  return { ok: true, trashed };
}
function registerStorageIpc() {
  electron.ipcMain.handle("storage:scan-outputs", () => scanOutputStorage());
  electron.ipcMain.handle("storage:trash-outputs", (_event, selection) =>
    trashOutputGroups(selection),
  );
  electron.ipcMain.handle("storage:list-canvas-projects", () =>
    listCanvasProjectSummaries(),
  );
  electron.ipcMain.handle("storage:list-canvas-backups", () =>
    listCanvasBackups(),
  );
  electron.ipcMain.handle("storage:restore-canvas-backup", (_event, fileName) =>
    restoreCanvasBackup(fileName),
  );
}
const DEFAULT_BASE_URL = "https://vectorizer-api.etoolbox.cn";
const MAX_UPLOAD_BYTES = 30 * 1024 * 1024;
const MAX_UPLOAD_PIXELS = 3145728;
const SUPPORTED_EXTENSIONS = /* @__PURE__ */ new Set([
  ".bmp",
  ".gif",
  ".jpeg",
  ".jpg",
  ".png",
  ".tif",
  ".tiff",
  ".webp",
]);
const activeRequests$1 = /* @__PURE__ */ new Map();
function settingsFile$1() {
  const directory = node_path.join(
    electron.app.getPath("userData"),
    "provider-settings",
  );
  node_fs.mkdirSync(directory, { recursive: true });
  return node_path.join(directory, "vectorizer-ai.json");
}
function readStored() {
  try {
    const parsed = JSON.parse(node_fs.readFileSync(settingsFile$1(), "utf8"));
    return {
      baseUrl: parsed.baseUrl || DEFAULT_BASE_URL,
      encryptedApiKey: parsed.encryptedApiKey || "",
    };
  } catch {
    return { baseUrl: DEFAULT_BASE_URL, encryptedApiKey: "" };
  }
}
function encrypt(value) {
  if (!electron.safeStorage.isEncryptionAvailable())
    throw new Error("系统安全存储不可用，无法安全保存 Vectorizer.AI 凭据");
  return electron.safeStorage.encryptString(value).toString("base64");
}
function decrypt(value) {
  if (!value || !electron.safeStorage.isEncryptionAvailable()) return "";
  try {
    return electron.safeStorage.decryptString(Buffer.from(value, "base64"));
  } catch {
    return "";
  }
}
function publicSettings(stored = readStored()) {
  const apiKey = decrypt(stored.encryptedApiKey);
  return {
    configured: Boolean(stored.baseUrl && apiKey),
    baseUrl: stored.baseUrl || DEFAULT_BASE_URL,
    apiKeyMasked: apiKey ? `••••••••${apiKey.slice(-4)}` : "",
  };
}
function getVectorizerAiSettings() {
  return publicSettings();
}
function saveVectorizerAiSettings(input) {
  const current = readStored();
  const baseUrl = (
    input.baseUrl?.trim() ||
    current.baseUrl ||
    DEFAULT_BASE_URL
  ).replace(/\/+$/, "");
  if (!/^https:\/\//i.test(baseUrl))
    throw new Error("接口地址必须使用 https://");
  const apiKey = input.apiKey?.trim();
  const next = {
    baseUrl,
    encryptedApiKey: apiKey ? encrypt(apiKey) : current.encryptedApiKey,
  };
  node_fs.writeFileSync(
    settingsFile$1(),
    JSON.stringify(next, null, 2),
    "utf8",
  );
  return publicSettings(next);
}
function vectorizeEndpoint(baseUrl) {
  const value = baseUrl.trim().replace(/\/+$/, "");
  const parsed = new URL(value);
  if (/\/vectorize$/i.test(parsed.pathname)) return value;
  if (/\/v1$/i.test(parsed.pathname)) return `${value}/vectorize`;
  return `${value}/v1/vectorize`;
}
function accountEndpoint(baseUrl, resource) {
  const parsed = new URL(baseUrl.trim());
  const pathname = parsed.pathname.replace(/\/+$/, "");
  if (/\/v1\/(?:vectorize|credit|recharge)$/i.test(pathname)) {
    parsed.pathname = pathname.replace(
      /\/(?:vectorize|credit|recharge)$/i,
      `/${resource}`,
    );
  } else if (/\/v1$/i.test(pathname)) {
    parsed.pathname = `${pathname}/${resource}`;
  } else {
    parsed.pathname = `${pathname}/v1/${resource}`.replace(/\/{2,}/g, "/");
  }
  parsed.search = "";
  parsed.hash = "";
  return parsed.toString().replace(/\/$/, "");
}
function credentials() {
  const stored = readStored();
  const apiKey = decrypt(stored.encryptedApiKey);
  if (!stored.baseUrl || !apiKey) throw new Error("请先保存接口地址和 API Key");
  return { stored, apiKey };
}
function readInput(file) {
  if (file.startsWith("data:")) {
    const match =
      /^data:(image\/(?:bmp|gif|jpeg|png|tiff|webp));base64,(.+)$/i.exec(file);
    if (!match)
      throw new Error("只支持 BMP、GIF、JPEG、PNG、TIFF 或 WebP 位图");
    const bytes = Uint8Array.from(Buffer.from(match[2], "base64"));
    const subtype = match[1].split("/")[1].toLowerCase();
    return {
      bytes,
      name: `canvas-input.${subtype === "jpeg" ? "jpg" : subtype}`,
      type: match[1],
    };
  }
  if (!node_fs.existsSync(file)) throw new Error(`找不到输入图片：${file}`);
  const extension = node_path.extname(file).toLowerCase();
  if (!SUPPORTED_EXTENSIONS.has(extension))
    throw new Error(
      "Vectorizer.AI 只支持 BMP、GIF、JPEG、PNG、TIFF 或 WebP 位图",
    );
  const type =
    extension === ".jpg" || extension === ".jpeg"
      ? "image/jpeg"
      : extension === ".tif" || extension === ".tiff"
        ? "image/tiff"
        : `image/${extension.slice(1)}`;
  return {
    bytes: Uint8Array.from(node_fs.readFileSync(file)),
    name: node_path.basename(file),
    type,
  };
}
async function prepareInput(file) {
  const source = readInput(file);
  const sourceBuffer = Buffer.from(source.bytes);
  let metadata;
  try {
    metadata = await sharp(sourceBuffer, {
      animated: false,
      failOn: "none",
    }).metadata();
  } catch {
    throw new Error(
      "无法读取输入图片，请换用有效的 PNG、JPEG、WebP、BMP、GIF 或 TIFF 文件",
    );
  }
  const swapsOrientation = [5, 6, 7, 8].includes(metadata.orientation || 1);
  const originalWidth = swapsOrientation
    ? metadata.height || 0
    : metadata.width || 0;
  const originalHeight = swapsOrientation
    ? metadata.width || 0
    : metadata.height || 0;
  if (!originalWidth || !originalHeight)
    throw new Error("无法识别输入图片的像素尺寸");
  const originalPixels = originalWidth * originalHeight;
  const scale =
    originalPixels > MAX_UPLOAD_PIXELS
      ? Math.sqrt(MAX_UPLOAD_PIXELS / originalPixels)
      : 1;
  const targetWidth = Math.max(1, Math.floor(originalWidth * scale));
  const targetHeight = Math.max(1, Math.floor(originalHeight * scale));
  const resized = scale < 1;
  const alreadyValidPng =
    source.type.toLowerCase() === "image/png" &&
    !resized &&
    (metadata.orientation || 1) === 1 &&
    source.bytes.byteLength <= MAX_UPLOAD_BYTES;
  if (alreadyValidPng) {
    return {
      bytes: source.bytes,
      name: source.name,
      type: "image/png",
      width: originalWidth,
      height: originalHeight,
      originalWidth,
      originalHeight,
      resized: false,
      convertedToPng: false,
    };
  }
  let pipeline = sharp(sourceBuffer, { animated: false, failOn: "none" })
    .rotate()
    .toColourspace("srgb");
  if (resized)
    pipeline = pipeline.resize({
      width: targetWidth,
      height: targetHeight,
      fit: "inside",
      withoutEnlargement: true,
      fastShrinkOnLoad: true,
    });
  const prepared = await pipeline
    .png({ compressionLevel: 9, adaptiveFiltering: true, force: true })
    .toBuffer({ resolveWithObject: true });
  if (prepared.data.byteLength > MAX_UPLOAD_BYTES)
    throw new Error("图片自动压缩后仍超过 30MB，请先降低图片复杂度后重试");
  if (prepared.info.width * prepared.info.height > MAX_UPLOAD_PIXELS)
    throw new Error("图片自动缩放后仍超过 3,145,728 像素，请换一张图片重试");
  return {
    bytes: Uint8Array.from(prepared.data),
    name: `${node_path.basename(source.name, node_path.extname(source.name)) || "canvas-input"}.png`,
    type: "image/png",
    width: prepared.info.width,
    height: prepared.info.height,
    originalWidth,
    originalHeight,
    resized,
    convertedToPng: source.type.toLowerCase() !== "image/png",
  };
}
async function errorMessage(response, operation = "vectorize") {
  const raw = await response.text();
  if (response.status === 401)
    return "API Key 鉴权失败（401）：请求已到达中转站，但该 Key 未被接受。请重新粘贴并保存；若仍失败，请联系卖家确认 Key 已启用且属于这个接口地址。";
  if (response.status === 403)
    return "API Key 无权访问（403）：请联系中转商确认此 Key 已开通矢量化接口权限和可用额度。";
  if (response.status === 400 && operation === "credit")
    return "查询额度失败（400）：中转站中不存在当前 API Key，请联系卖家核对。";
  if (response.status === 400 && operation === "recharge")
    return "充值失败（400）：充值秘钥无效或已被使用，或者中转站中不存在当前 API Key。请核对后重试。";
  if (isQuotaMessage(raw) || response.status === 402)
    return "中转站返回“API Key 额度已耗尽”。这说明 Key 已通过鉴权，但卖家后台分配给该 Key 的可用额度为 0 或套餐尚未绑定。请让卖家核对这把 Key 的余额、套餐绑定和矢量化接口权限。";
  if (response.status === 429)
    return "请求过于频繁（429）：已自动退避重试，但仍超过当前 API Key 的 QPS 限制。请稍后再试。";
  try {
    const parsed = JSON.parse(raw);
    const message2 = parsed.error?.message || parsed.message || raw;
    return parsed.error?.code
      ? `${message2}（错误码 ${parsed.error.code}）`
      : message2;
  } catch {
    return /<html|<!doctype/i.test(raw)
      ? `Vectorizer.AI 服务返回 HTTP ${response.status}`
      : raw || `HTTP ${response.status}`;
  }
}
function finiteNumber(value, field) {
  const parsed = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(parsed) || parsed < 0)
    throw new Error(`中转站返回的 ${field} 字段无效`);
  return parsed;
}
async function getVectorizerAiCredit() {
  const { stored, apiKey } = credentials();
  const response = await fetch(accountEndpoint(stored.baseUrl, "credit"), {
    method: "GET",
    headers: { "x-api-key": apiKey },
    signal: AbortSignal.timeout(3e4),
  });
  if (!response.ok) throw new Error(await errorMessage(response, "credit"));
  const data = await response.json();
  return { remaining: finiteNumber(data.remaining, "remaining") };
}
async function rechargeVectorizerAi(request) {
  const rechargeKey = request?.rechargeKey?.trim();
  if (!rechargeKey) throw new Error("请输入充值秘钥");
  if (rechargeKey.length > 512) throw new Error("充值秘钥格式无效");
  const { stored, apiKey } = credentials();
  const response = await fetch(accountEndpoint(stored.baseUrl, "recharge"), {
    method: "POST",
    headers: { "x-api-key": apiKey, "Content-Type": "application/json" },
    body: JSON.stringify({ rechargeKey }),
    signal: AbortSignal.timeout(3e4),
  });
  if (!response.ok) throw new Error(await errorMessage(response, "recharge"));
  const data = await response.json();
  return {
    credit: finiteNumber(data.credit, "credit"),
    remaining: finiteNumber(data.remaining, "remaining"),
  };
}
function isQuotaMessage(value) {
  return /额度.{0,8}(耗尽|不足|为\s*0)|余额.{0,8}(不足|为\s*0)|quota.{0,12}(exhaust|exceed|empty|insufficient)|insufficient.{0,12}(credit|balance)|out of credits/i.test(
    value,
  );
}
function retryDelayMs(response, attempt) {
  const retryAfter = response.headers.get("retry-after");
  const seconds = retryAfter ? Number(retryAfter) : Number.NaN;
  if (Number.isFinite(seconds) && seconds >= 0)
    return Math.min(1e4, Math.max(500, seconds * 1e3));
  return Math.min(8e3, 1e3 * 2 ** attempt);
}
async function testVectorizerAiConnection() {
  const stored = readStored();
  const result2 = await getVectorizerAiCredit();
  const endpoint2 = accountEndpoint(stored.baseUrl, "credit");
  return {
    ok: true,
    message: `鉴权通过，剩余调用额度 ${result2.remaining} 次`,
    endpoint: endpoint2,
    remaining: result2.remaining,
  };
}
async function vectorizeWithVectorizerAi(request) {
  const stored = readStored();
  const apiKey = decrypt(stored.encryptedApiKey);
  if (!stored.baseUrl || !apiKey)
    throw new Error("请先在“模型与中转站”设置中填写矢量接口地址和 API Key");
  if (!["test", "preview", "production"].includes(request.mode))
    throw new Error("无效的 Vectorizer.AI 运行模式");
  const input = await prepareInput(request.file);
  node_fs.mkdirSync(request.outputDir, { recursive: true });
  const requestId = request.requestId || node_crypto.randomUUID();
  activeRequests$1.get(requestId)?.abort();
  const controller = new AbortController();
  activeRequests$1.set(requestId, controller);
  let response;
  try {
    for (let attempt = 0; attempt < 3; attempt += 1) {
      const form = new FormData();
      const imageBuffer = input.bytes.buffer.slice(
        input.bytes.byteOffset,
        input.bytes.byteOffset + input.bytes.byteLength,
      );
      form.append(
        "image",
        new Blob([imageBuffer], { type: input.type }),
        input.name,
      );
      form.append("mode", request.mode);
      form.append("input.max_pixels", String(MAX_UPLOAD_PIXELS));
      form.append("policy.retention_days", "0");
      form.append("output.file_format", "svg");
      if (
        !request.preserveGradientDetail &&
        request.maxColors &&
        request.maxColors >= 1 &&
        request.maxColors <= 256
      ) {
        form.append(
          "processing.max_colors",
          String(Math.round(request.maxColors)),
        );
      }
      if (
        Number.isFinite(request.minShapeArea) &&
        request.minShapeArea >= 0 &&
        request.minShapeArea <= 100
      ) {
        form.append(
          "processing.shapes.min_area_px",
          String(request.minShapeArea),
        );
      }
      if (
        request.shapeStacking === "cutouts" ||
        request.shapeStacking === "stacked"
      )
        form.append("output.shape_stacking", request.shapeStacking);
      if (
        request.groupBy &&
        ["none", "color", "parent", "layer"].includes(request.groupBy)
      )
        form.append("output.group_by", request.groupBy);
      if (typeof request.adobeCompatibilityMode === "boolean")
        form.append(
          "output.svg.adobe_compatibility_mode",
          String(request.adobeCompatibilityMode),
        );
      if (typeof request.flattenParameterizedShapes === "boolean")
        form.append(
          "output.parameterized_shapes.flatten",
          String(request.flattenParameterizedShapes),
        );
      if (
        Number.isFinite(request.lineFitTolerance) &&
        request.lineFitTolerance >= 1e-3 &&
        request.lineFitTolerance <= 1
      ) {
        form.append(
          "output.curves.line_fit_tolerance",
          String(request.lineFitTolerance),
        );
      }
      if (typeof request.gapFillerEnabled === "boolean")
        form.append(
          "output.gap_filler.enabled",
          String(request.gapFillerEnabled),
        );
      response = await fetch(vectorizeEndpoint(stored.baseUrl), {
        method: "POST",
        headers: { "x-api-key": apiKey },
        body: form,
        signal: AbortSignal.any([controller.signal, AbortSignal.timeout(21e4)]),
      });
      if (response.status !== 429) break;
      const rateLimitBody = await response.clone().text();
      if (isQuotaMessage(rateLimitBody) || attempt === 2) break;
      await new Promise((resolve, reject) => {
        const timer = setTimeout(resolve, retryDelayMs(response, attempt));
        controller.signal.addEventListener(
          "abort",
          () => {
            clearTimeout(timer);
            reject(new DOMException("已停止", "AbortError"));
          },
          { once: true },
        );
      });
    }
  } catch (error) {
    if (controller.signal.aborted) throw new Error("已停止 Vectorizer.AI 请求");
    if (error instanceof DOMException && error.name === "TimeoutError")
      throw new Error("Vectorizer.AI 请求超过 210 秒，已自动停止");
    throw error;
  } finally {
    if (activeRequests$1.get(requestId) === controller)
      activeRequests$1.delete(requestId);
  }
  if (!response) throw new Error("Vectorizer.AI 请求未发送");
  if (!response.ok) throw new Error(await errorMessage(response));
  const contentType =
    response.headers.get("content-type") ||
    (request.mode === "preview" ? "image/png" : "image/svg+xml");
  const extension =
    contentType.includes("png") || request.mode === "preview" ? ".png" : ".svg";
  const stem =
    node_path
      .basename(input.name, node_path.extname(input.name))
      .replace(/[^a-zA-Z0-9._-]+/g, "_")
      .slice(0, 80) || "vectorized";
  const outputPath = node_path.join(
    request.outputDir,
    `${stem}-vectorizer-${node_crypto.randomUUID().slice(0, 8)}${extension}`,
  );
  node_fs.writeFileSync(outputPath, Buffer.from(await response.arrayBuffer()));
  return {
    outputPath,
    outputUrl: node_url.pathToFileURL(outputPath).toString(),
    contentType,
    mode: request.mode,
    inputWidth: input.width,
    inputHeight: input.height,
    inputOriginalWidth: input.originalWidth,
    inputOriginalHeight: input.originalHeight,
    inputUploadBytes: input.bytes.byteLength,
    inputResized: input.resized,
    inputConvertedToPng: input.convertedToPng,
    creditsCalculated: response.headers.get("x-credits-calculated") || void 0,
    creditsCharged: response.headers.get("x-credits-charged") || void 0,
  };
}
function cancelVectorizerAiRequest(requestId) {
  const controller = activeRequests$1.get(requestId);
  if (!controller) return false;
  controller.abort();
  activeRequests$1.delete(requestId);
  return true;
}
function clipDuration(clip) {
  return (
    Math.max(0, clip.outPoint - clip.inPoint) / Math.max(0.05, clip.speed || 1)
  );
}
function projectDuration(project) {
  if (!project.clips.length) return 0;
  return Math.max(
    ...project.clips.map((c) => c.timelineStart + clipDuration(c)),
  );
}
function runFfmpeg(args, onProgress, timeoutMs = 18e5) {
  return new Promise(async (resolve, reject) => {
    const ffmpegBin = await findFfmpeg();
    const child = node_child_process.spawn(ffmpegBin, args, {
      windowsHide: true,
    });
    let stdout = "";
    let stderr = "";
    let settled = false;
    const timer = setTimeout(() => {
      if (settled) return;
      settled = true;
      try {
        child.kill("SIGKILL");
      } catch {}
      resolve({
        stdout,
        stderr:
          stderr +
          `
[timeout after ${Math.round(timeoutMs / 1e3)}s]`,
        code: -999,
      });
    }, timeoutMs);
    child.stdout.on("data", (chunk) => {
      stdout += chunk.toString("utf8");
    });
    child.stderr.on("data", (chunk) => {
      const text = chunk.toString("utf8");
      stderr += text;
      if (onProgress) {
        const lines = text.split(/\r?\n/);
        for (const line of lines) {
          if (line.includes("time=")) onProgress(line.trim());
        }
      }
    });
    child.once("error", (err) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      reject(err);
    });
    child.once("exit", (code) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      resolve({ stdout, stderr, code });
    });
  });
}
async function getVideoMeta(filePath2) {
  if (!node_fs.existsSync(filePath2))
    throw new Error(`视频文件不存在: ${filePath2}`);
  const ffmpegBin = await findFfmpeg();
  const probeResult = await new Promise((resolve, reject) => {
    const child = node_child_process.spawn(
      ffmpegBin,
      ["-i", filePath2, "-f", "null", "-"],
      { windowsHide: true },
    );
    let stderr = "";
    child.stderr.on("data", (chunk) => {
      stderr += chunk.toString("utf8");
    });
    child.once("error", reject);
    child.once("exit", () => resolve(stderr));
  });
  const durationMatch = probeResult.match(/Duration:\s*(\d+):(\d+):(\d+\.\d+)/);
  const duration = durationMatch
    ? parseInt(durationMatch[1]) * 3600 +
      parseInt(durationMatch[2]) * 60 +
      parseFloat(durationMatch[3])
    : 0;
  const videoMatch = probeResult.match(
    /Stream.*Video:\s*(\S+).*,\s*(\d+)x(\d+)[^\n]*(\d+(?:\.\d+)?)\s*fps/,
  );
  const width = videoMatch ? parseInt(videoMatch[2]) : 1920;
  const height = videoMatch ? parseInt(videoMatch[3]) : 1080;
  const fps = videoMatch ? parseFloat(videoMatch[4]) : 30;
  const codec = videoMatch ? videoMatch[1] : void 0;
  const hasAudio = /Stream.*Audio:/.test(probeResult);
  return { duration, width, height, fps, hasAudio, codec };
}
async function generateThumbnails(request) {
  if (!node_fs.existsSync(request.path))
    throw new Error(`视频文件不存在: ${request.path}`);
  const { statSync } = await import("node:fs");
  node_fs.mkdirSync(request.outputDir, { recursive: true });
  const count = Math.max(4, Math.min(20, request.count));
  const meta = await getVideoMeta(request.path);
  if (meta.duration <= 0) throw new Error("无法获取视频时长");
  const thumbHeight = 72;
  const thumbWidth = Math.round(thumbHeight * (meta.width / meta.height));
  const stat = statSync(request.path);
  const outputPath = node_path.join(
    request.outputDir,
    `thumb-${node_path.basename(request.path).replace(/\.[^.]+$/, "")}-${stat.size}-${Math.floor(stat.mtimeMs / 1e3)}-${count}.jpg`,
  );
  if (node_fs.existsSync(outputPath))
    return node_url.pathToFileURL(outputPath).toString();
  try {
    const { readdirSync, unlinkSync } = await import("node:fs");
    const legacyPrefix = `thumb-${node_path.basename(request.path).replace(/\.[^.]+$/, "")}-`;
    for (const name of readdirSync(request.outputDir)) {
      if (
        name.startsWith(legacyPrefix) &&
        name !== node_path.basename(outputPath)
      ) {
        const segments = name
          .slice(legacyPrefix.length)
          .split("-")
          .filter(Boolean);
        if (segments.length === 1 && /^\d+\.jpe?g$/i.test(segments[0])) {
          try {
            unlinkSync(node_path.join(request.outputDir, name));
          } catch {}
        }
      }
    }
  } catch {}
  const interval = meta.duration / (count + 1);
  const selectExpr = Array.from(
    { length: count },
    (_, i) => `eq(n\\,${Math.round(i * interval * meta.fps)})`,
  ).join("+");
  const args = [
    "-i",
    request.path,
    "-vf",
    `select='${selectExpr}',scale=${thumbWidth}:${thumbHeight},tile=${count}x1`,
    "-frames:v",
    "1",
    "-q:v",
    "3",
    "-y",
    outputPath,
  ];
  const result2 = await runFfmpeg(args);
  if (result2.code !== 0 || !node_fs.existsSync(outputPath)) {
    throw new Error(`缩略图生成失败: ${result2.stderr.slice(-500)}`);
  }
  return node_url.pathToFileURL(outputPath).toString();
}
async function renderComposition(request, onProgress) {
  const { project, outputDir: outputDir2 } = request;
  if (!project.clips.length)
    return { outputPath: "", success: false, error: "没有片段" };
  node_fs.mkdirSync(outputDir2, { recursive: true });
  const totalDuration = projectDuration(project);
  if (totalDuration <= 0)
    return { outputPath: "", success: false, error: "时间轴为空" };
  const outputPath = node_path.join(outputDir2, `export-${Date.now()}.mp4`);
  await findFfmpeg();
  const sortedClips = [...project.clips].sort(
    (a, b) => a.trackIndex - b.trackIndex || a.timelineStart - b.timelineStart,
  );
  const videoClips = sortedClips.filter((c) => (c.kind || "video") === "video");
  const primaryTrackIndex = Math.min(
    ...videoClips.map((clip) => clip.trackIndex),
  );
  const mainTrackClips = videoClips.filter(
    (c) => c.trackIndex === primaryTrackIndex,
  );
  if (mainTrackClips.length === 0)
    return { outputPath: "", success: false, error: "主轨道没有片段" };
  const hasTransitions = project.transitions.some(
    (t) => t.type !== "none" && t.duration > 0,
  );
  const extraClips = sortedClips.filter(
    (clip) =>
      clip.kind === "audio" ||
      ((clip.kind || "video") === "video" &&
        clip.trackIndex !== primaryTrackIndex),
  );
  const wantsInterpolate =
    project.interpolateFrames === true && (project.exportFps || 30) === 60;
  const needsPostProcess = extraClips.length > 0 || wantsInterpolate;
  const baseOutputPath = needsPostProcess
    ? node_path.join(outputDir2, `_editor-base-${Date.now()}.mp4`)
    : outputPath;
  let baseResult;
  if (hasTransitions || (project.captions?.length || 0) > 0) {
    baseResult = await renderWithTransitions(
      project,
      mainTrackClips,
      baseOutputPath,
      outputDir2,
      onProgress,
    );
  } else {
    baseResult = await renderWithConcat(
      project,
      mainTrackClips,
      baseOutputPath,
      outputDir2,
      onProgress,
    );
  }
  if (!baseResult.success || !needsPostProcess) return baseResult;
  return postProcessTracks(
    project,
    baseOutputPath,
    extraClips,
    outputPath,
    onProgress,
  );
}
async function postProcessTracks(
  project,
  basePath,
  extras,
  outputPath,
  onProgress,
) {
  const inputArgs = ["-i", basePath];
  for (const clip of extras)
    inputArgs.push(
      "-ss",
      String(clip.inPoint),
      "-t",
      String(Math.max(0.05, clip.outPoint - clip.inPoint)),
      "-i",
      clip.sourcePath,
    );
  const filterParts = [];
  let videoLabel = "0:v";
  const audioLabels = ["0:a"];
  for (let index = 0; index < extras.length; index++) {
    const clip = extras[index];
    const inputIndex = index + 1;
    const duration = clipDuration(clip);
    const muted = project.tracks.find(
      (track) => track.index === clip.trackIndex,
    )?.muted;
    const effectiveClip = muted ? { ...clip, volume: 0 } : clip;
    if ((clip.kind || "video") === "video") {
      const prepared = `overlay${inputIndex}`;
      filterParts.push(
        `[${inputIndex}:v]${buildVideoFilters(effectiveClip, project.width, project.height, project.fps || 30, duration, project.interpolateFrames === true)},setpts=PTS+${clip.timelineStart}/TB[${prepared}]`,
      );
      const combined = `vstack${inputIndex}`;
      filterParts.push(
        `[${videoLabel}][${prepared}]overlay=0:0:eof_action=pass:enable='between(t,${clip.timelineStart},${clip.timelineStart + duration})'[${combined}]`,
      );
      videoLabel = combined;
    }
    if (clip.hasAudio || clip.kind === "audio") {
      const audioLabel = `amix${inputIndex}`;
      const speed = Math.max(0.25, Math.min(4, clip.speed || 1));
      filterParts.push(
        `[${inputIndex}:a]aresample=48000:async=1:first_pts=0,aformat=sample_fmts=fltp:channel_layouts=stereo,asetpts=PTS-STARTPTS,${buildAudioFilters(effectiveClip, speed, duration)},atrim=0:${duration},asetpts=PTS+${clip.timelineStart}/TB[${audioLabel}]`,
      );
      audioLabels.push(audioLabel);
    }
  }
  let finalVideo = videoLabel;
  if (project.interpolateFrames === true && (project.exportFps || 30) === 60) {
    filterParts.push(`[${videoLabel}]fps=60[v60]`);
    finalVideo = "v60";
  } else {
    filterParts.push(`[${videoLabel}]fps=${project.exportFps || 30}[vfps]`);
    finalVideo = "vfps";
  }
  filterParts.push(
    `${audioLabels.map((label) => `[${label}]`).join("")}amix=inputs=${audioLabels.length}:duration=longest:dropout_transition=0,aresample=48000:async=1:first_pts=0,aformat=sample_fmts=fltp:sample_rates=48000:channel_layouts=stereo,atrim=0:${projectDuration(project)}[audioout]`,
  );
  onProgress?.({ progress: 0.82, phase: "保真合成视频…" });
  let result2 = await runFfmpeg([
    "-y",
    ...inputArgs,
    "-filter_complex",
    filterParts.join(";"),
    "-map",
    `[${finalVideo}]`,
    "-map",
    "[audioout]",
    "-c:v",
    "libx264",
    "-preset",
    "fast",
    "-crf",
    "20",
    "-c:a",
    "aac",
    "-b:a",
    "192k",
    "-ar",
    "48000",
    "-ac",
    "2",
    "-movflags",
    "+faststart",
    "-shortest",
    outputPath,
  ]);
  try {
    const { unlinkSync } = await import("node:fs");
    unlinkSync(basePath);
  } catch {}
  if (result2.code !== 0 || !node_fs.existsSync(outputPath))
    return {
      outputPath: "",
      success: false,
      error: `多轨/补帧渲染失败: ${result2.stderr.slice(-700)}`,
    };
  onProgress?.({ progress: 1, phase: "完成" });
  return { outputPath, success: true };
}
async function renderWithConcat(
  project,
  clips,
  outputPath,
  outputDir2,
  onProgress,
) {
  await findFfmpeg();
  const renderId = Date.now();
  const tempFiles = [];
  for (let i = 0; i < clips.length; i++) {
    const clip = clips[i];
    onProgress?.({
      progress: (i / clips.length) * 0.5,
      phase: `裁剪片段 ${i + 1}/${clips.length}`,
    });
    const tempPath = node_path.join(
      outputDir2,
      `_tmp_clip_${renderId}_${i}.mp4`,
    );
    const sourceDuration = Math.max(0.05, clip.outPoint - clip.inPoint);
    const speed = Math.max(0.25, Math.min(4, clip.speed || 1));
    const duration = sourceDuration / speed;
    const trackMuted = project.tracks.find(
      (track) => track.index === clip.trackIndex,
    )?.muted;
    const effectiveClip = trackMuted ? { ...clip, volume: 0 } : clip;
    const videoFilters = buildVideoFilters(
      effectiveClip,
      project.width,
      project.height,
      project.fps,
      duration,
      project.interpolateFrames === true,
    );
    const audioFilters = buildAudioFilters(effectiveClip, speed, duration);
    const args = [
      "-y",
      "-ss",
      String(clip.inPoint),
      "-t",
      String(sourceDuration),
      "-i",
      clip.sourcePath,
      ...(!clip.hasAudio
        ? [
            "-f",
            "lavfi",
            "-t",
            String(duration),
            "-i",
            "anullsrc=channel_layout=stereo:sample_rate=48000",
          ]
        : []),
      "-c:v",
      "libx264",
      "-preset",
      "fast",
      "-crf",
      "20",
      "-c:a",
      "aac",
      "-b:a",
      "192k",
      ...(clip.hasAudio
        ? ["-af", audioFilters]
        : ["-map", "0:v:0", "-map", "1:a:0", "-shortest"]),
      "-vf",
      videoFilters,
      "-r",
      String(project.interpolateFrames === true ? 60 : project.fps || 30),
      tempPath,
    ];
    const result22 = await runFfmpeg(args);
    if (result22.code !== 0 || !node_fs.existsSync(tempPath)) {
      return {
        outputPath: "",
        success: false,
        error: `片段 ${i + 1} 裁剪失败: ${result22.stderr.slice(-300)}`,
      };
    }
    tempFiles.push(tempPath);
  }
  onProgress?.({ progress: 0.6, phase: "拼接片段…" });
  const { writeFileSync } = await import("node:fs");
  const listFile = node_path.join(outputDir2, `_concat_list_${renderId}.txt`);
  writeFileSync(
    listFile,
    tempFiles.map((f) => `file '${f.replace(/'/g, "'\\''")}'`).join("\n"),
    "utf8",
  );
  const concatArgs = [
    "-y",
    "-f",
    "concat",
    "-safe",
    "0",
    "-i",
    listFile,
    "-c",
    "copy",
    outputPath,
  ];
  let result2 = await runFfmpeg(concatArgs, (line) => {
    const timeMatch = line.match(/time=(\d+):(\d+):(\d+\.\d+)/);
    if (timeMatch) {
      const t =
        parseInt(timeMatch[1]) * 3600 +
        parseInt(timeMatch[2]) * 60 +
        parseFloat(timeMatch[3]);
      onProgress?.({ progress: 0.6 + Math.min(0.4, t / 60), phase: "合成中…" });
    }
  });
  if (result2.code !== 0 || !node_fs.existsSync(outputPath)) {
    onProgress?.({
      progress: 0.65,
      phase: "快速拼接失败，重编码合成中…（这一步耗时较长，请耐心等待）",
    });
    const recodeArgs = [
      "-y",
      "-f",
      "concat",
      "-safe",
      "0",
      "-i",
      listFile,
      "-c:v",
      "libx264",
      "-preset",
      "fast",
      "-crf",
      "20",
      "-c:a",
      "aac",
      "-b:a",
      "128k",
      outputPath,
    ];
    result2 = await runFfmpeg(recodeArgs, (line) => {
      const timeMatch = line.match(/time=(\d+):(\d+):(\d+\.\d+)/);
      if (timeMatch) {
        const t =
          parseInt(timeMatch[1]) * 3600 +
          parseInt(timeMatch[2]) * 60 +
          parseFloat(timeMatch[3]);
        onProgress?.({
          progress:
            0.65 + Math.min(0.3, t / Math.max(60, projectDuration(project))),
          phase: "重编码合成中…",
        });
      }
    });
    if (result2.code !== 0 || !node_fs.existsSync(outputPath)) {
      return {
        outputPath: "",
        success: false,
        error: `拼接失败: ${result2.stderr.slice(-300)}`,
      };
    }
  }
  const { unlinkSync } = await import("node:fs");
  try {
    unlinkSync(listFile);
    for (const f of tempFiles) unlinkSync(f);
  } catch {}
  onProgress?.({ progress: 1, phase: "完成" });
  return { outputPath, success: true };
}
function atempoChain(speed) {
  const filters = [];
  let remaining = speed;
  while (remaining > 2) {
    filters.push("atempo=2");
    remaining /= 2;
  }
  while (remaining < 0.5) {
    filters.push("atempo=0.5");
    remaining /= 0.5;
  }
  filters.push(`atempo=${remaining.toFixed(4)}`);
  return filters.join(",");
}
function buildVideoFilters(
  clip,
  width,
  height,
  fps,
  duration,
  interpolateTo60 = false,
) {
  const filters = [];
  if (clip.mirrorX) filters.push("hflip");
  if (clip.rotation === 90) filters.push("transpose=1");
  else if (clip.rotation === 180) filters.push("hflip,vflip");
  else if (clip.rotation === 270) filters.push("transpose=2");
  filters.push(
    `eq=brightness=${clip.brightness ?? 0}:contrast=${clip.contrast ?? 1}:saturation=${clip.saturation ?? 1}`,
  );
  filters.push(
    `scale=${width}:${height}:force_original_aspect_ratio=decrease,pad=${width}:${height}:(ow-iw)/2:(oh-ih)/2,setsar=1,fps=${fps || 30},format=yuv420p,settb=AVTB`,
  );
  const speed = Math.max(0.25, Math.min(4, clip.speed || 1));
  filters.push(`setpts=(PTS-STARTPTS)/${speed}`);
  if (interpolateTo60)
    filters.push("minterpolate=fps=60:mi_mode=mci:mc_mode=aobmc:me_mode=bidir");
  if ((clip.fadeIn || 0) > 0)
    filters.push(
      `fade=t=in:st=0:d=${Math.min(clip.fadeIn || 0, duration / 2)}`,
    );
  if ((clip.fadeOut || 0) > 0)
    filters.push(
      `fade=t=out:st=${Math.max(0, duration - Math.min(clip.fadeOut || 0, duration / 2))}:d=${Math.min(clip.fadeOut || 0, duration / 2)}`,
    );
  return filters.join(",");
}
function escapeDrawtext(text) {
  return text
    .replace(/\\/g, "\\\\")
    .replace(/:/g, "\\:")
    .replace(/'/g, "\\'")
    .replace(/%/g, "\\%")
    .replace(/\r?\n/g, "\\n");
}
function captionFilters(project) {
  const fontPath =
    process.platform === "win32" ? "C\\:/Windows/Fonts/msyh.ttc" : "";
  return (project.captions || [])
    .filter((caption) => caption.text.trim() && caption.duration > 0)
    .map((caption) => {
      const hasFreePosition =
        Number.isFinite(caption.x) && Number.isFinite(caption.y);
      const x = hasFreePosition
        ? `w*${Math.max(0, Math.min(1, caption.x))}-text_w/2`
        : "(w-text_w)/2";
      const y = hasFreePosition
        ? `h*${Math.max(0, Math.min(1, caption.y))}-text_h/2`
        : caption.position === "top"
          ? "h*0.08"
          : caption.position === "center"
            ? "(h-text_h)/2"
            : "h-text_h-h*0.08";
      return `drawtext=${fontPath ? `fontfile='${fontPath}':` : ""}text='${escapeDrawtext(caption.text)}':fontcolor=${caption.color || "#ffffff"}:fontsize=${Math.max(12, caption.fontSize || 42)}:borderw=3:bordercolor=black@0.75:x=${x}:y=${y}:enable='between(t,${Math.max(0, caption.start)},${Math.max(0, caption.start + caption.duration)})'`;
    });
}
function buildAudioFilters(clip, speed, duration) {
  const filters = [
    atempoChain(speed),
    `volume=${Math.max(0, Math.min(2, clip.volume))}`,
  ];
  if ((clip.fadeIn || 0) > 0)
    filters.push(
      `afade=t=in:st=0:d=${Math.min(clip.fadeIn || 0, duration / 2)}`,
    );
  if ((clip.fadeOut || 0) > 0)
    filters.push(
      `afade=t=out:st=${Math.max(0, duration - Math.min(clip.fadeOut || 0, duration / 2))}:d=${Math.min(clip.fadeOut || 0, duration / 2)}`,
    );
  return filters.join(",");
}
async function renderWithTransitions(
  project,
  clips,
  outputPath,
  outputDir2,
  onProgress,
) {
  await findFfmpeg();
  const inputArgs = [];
  for (const clip of clips) {
    inputArgs.push(
      "-ss",
      String(clip.inPoint),
      "-t",
      String(Math.max(0.05, clip.outPoint - clip.inPoint)),
      "-i",
      clip.sourcePath,
    );
  }
  const filterParts = [];
  const targetW = project.width || clips[0].sourceWidth;
  const targetH = project.height || clips[0].sourceHeight;
  const targetFps = project.fps || clips[0].sourceFps || 30;
  for (let i = 0; i < clips.length; i++) {
    const duration = clipDuration(clips[i]);
    const trackMuted = project.tracks.find(
      (track) => track.index === clips[i].trackIndex,
    )?.muted;
    const effectiveClip = trackMuted ? { ...clips[i], volume: 0 } : clips[i];
    filterParts.push(
      `[${i}:v]${buildVideoFilters(effectiveClip, targetW, targetH, targetFps, duration, project.interpolateFrames === true)}[v${i}]`,
    );
    if (clips[i].hasAudio) {
      const speed = Math.max(0.25, Math.min(4, clips[i].speed || 1));
      filterParts.push(
        `[${i}:a]aresample=48000:async=1:first_pts=0,aformat=sample_fmts=fltp:channel_layouts=stereo,asetpts=PTS-STARTPTS,${buildAudioFilters(effectiveClip, speed, duration)},atrim=0:${duration}[a${i}]`,
      );
    } else
      filterParts.push(
        `anullsrc=r=48000:cl=stereo,atrim=0:${duration},asetpts=PTS-STARTPTS[a${i}]`,
      );
  }
  const transitions = project.transitions.filter(
    (t) => t.type !== "none" && t.duration > 0,
  );
  let prevVideoLabel = `v0`;
  let prevAudioLabel = "a0";
  let accumulatedOffset = clipDuration(clips[0]);
  for (let i = 1; i < clips.length; i++) {
    const transition = transitions.find((t) => t.toClipId === clips[i].id);
    const maxTransition = Math.min(
      accumulatedOffset - 0.05,
      clipDuration(clips[i]) - 0.05,
    );
    const tDuration =
      transition && maxTransition > 0.05
        ? Math.max(0.05, Math.min(transition.duration, maxTransition))
        : 0;
    if (tDuration > 0) {
      const bodyDuration = Math.max(0, accumulatedOffset - tDuration);
      const nextDuration = clipDuration(clips[i]);
      const lumaTarget = transition?.type === "fade-white" ? 255 : 0;
      const fadeDuration = tDuration * 0.4;
      const fadeOutStart = tDuration - fadeDuration;
      const flashLuma = `if(lt(T,${fadeDuration}),A+(${lumaTarget}-A)*T/${fadeDuration},if(lt(T,${fadeOutStart}),${lumaTarget},${lumaTarget}+(B-${lumaTarget})*(T-${fadeOutStart})/${fadeDuration}))`;
      const flashChroma = `if(lt(T,${fadeDuration}),A+(128-A)*T/${fadeDuration},if(lt(T,${fadeOutStart}),128,128+(B-128)*(T-${fadeOutStart})/${fadeDuration}))`;
      const blendOptions =
        transition?.type === "fade-black" || transition?.type === "fade-white"
          ? `c0_expr='${flashLuma}':c1_expr='${flashChroma}':c2_expr='${flashChroma}'`
          : `all_expr='A*(1-T/${tDuration})+B*(T/${tDuration})'`;
      const previousBodySource = `vpbs${i}`;
      const previousTailSource = `vpts${i}`;
      const nextHeadSource = `vnhs${i}`;
      const nextBodySource = `vnbs${i}`;
      const previousBody = `vpb${i}`;
      const previousTail = `vpt${i}`;
      const nextHead = `vnh${i}`;
      const nextBody = `vnb${i}`;
      const blended = `vblend${i}`;
      const outV = `vt${i}`;
      filterParts.push(
        `[${prevVideoLabel}]split=2[${previousBodySource}][${previousTailSource}]`,
      );
      filterParts.push(
        `[${previousBodySource}]trim=0:${bodyDuration},setpts=PTS-STARTPTS[${previousBody}]`,
      );
      filterParts.push(
        `[${previousTailSource}]trim=${bodyDuration}:${accumulatedOffset},setpts=PTS-STARTPTS[${previousTail}]`,
      );
      filterParts.push(`[v${i}]split=2[${nextHeadSource}][${nextBodySource}]`);
      filterParts.push(
        `[${nextHeadSource}]trim=0:${tDuration},setpts=PTS-STARTPTS[${nextHead}]`,
      );
      filterParts.push(
        `[${nextBodySource}]trim=${tDuration}:${nextDuration},setpts=PTS-STARTPTS[${nextBody}]`,
      );
      filterParts.push(
        `[${previousTail}][${nextHead}]blend=${blendOptions}:shortest=1[${blended}]`,
      );
      filterParts.push(
        `[${previousBody}][${blended}][${nextBody}]concat=n=3:v=1:a=0[${outV}]`,
      );
      const outA = `at${i}`;
      filterParts.push(
        `[${prevAudioLabel}][a${i}]acrossfade=d=${tDuration}:c1=tri:c2=tri[${outA}]`,
      );
      prevAudioLabel = outA;
      prevVideoLabel = outV;
      accumulatedOffset += clipDuration(clips[i]) - tDuration;
    } else {
      const outV = `vt${i}`;
      filterParts.push(`[${prevVideoLabel}][v${i}]concat=n=2:v=1:a=0[${outV}]`);
      prevVideoLabel = outV;
      const outA = `at${i}`;
      filterParts.push(`[${prevAudioLabel}][a${i}]concat=n=2:v=0:a=1[${outA}]`);
      prevAudioLabel = outA;
      accumulatedOffset += clipDuration(clips[i]);
    }
  }
  let finalVideoLabel = prevVideoLabel;
  const captions = captionFilters(project);
  if (captions.length) {
    filterParts.push(`[${prevVideoLabel}]${captions.join(",")}[vcaption]`);
    finalVideoLabel = "vcaption";
  }
  let finalAudioLabel = prevAudioLabel;
  if (prevAudioLabel) {
    filterParts.push(
      `[${prevAudioLabel}]aresample=48000:async=1:first_pts=0,aformat=sample_fmts=fltp:channel_layouts=stereo,apad,atrim=0:${Math.max(0.05, accumulatedOffset)}[afinal]`,
    );
    finalAudioLabel = "afinal";
  }
  const filterComplex = filterParts.join(";");
  const finalArgs = [
    ...inputArgs,
    "-filter_complex",
    filterComplex,
    "-map",
    `[${finalVideoLabel}]`,
    ...(finalAudioLabel ? ["-map", `[${finalAudioLabel}]`] : []),
    "-c:v",
    "libx264",
    "-preset",
    "fast",
    "-crf",
    "20",
    "-c:a",
    "aac",
    "-b:a",
    "128k",
    "-ar",
    "48000",
    "-ac",
    "2",
    "-shortest",
    "-movflags",
    "+faststart",
    "-y",
    outputPath,
  ];
  const result2 = await runFfmpeg(finalArgs, (line) => {
    const timeMatch = line.match(/time=(\d+):(\d+):(\d+\.\d+)/);
    if (timeMatch) {
      const t =
        parseInt(timeMatch[1]) * 3600 +
        parseInt(timeMatch[2]) * 60 +
        parseFloat(timeMatch[3]);
      onProgress?.({
        progress: Math.min(0.95, t / projectDuration(project)),
        phase: "渲染转场…",
      });
    }
  });
  if (result2.code !== 0 || !node_fs.existsSync(outputPath)) {
    return {
      outputPath: "",
      success: false,
      error: `转场渲染失败: ${result2.stderr.slice(-500)}`,
    };
  }
  onProgress?.({ progress: 1, phase: "完成" });
  return { outputPath, success: true };
}
const TTS_PORT = 7861;
const TTS_HOST = "127.0.0.1";
const LOCAL_TTS_BASE = `http://${TTS_HOST}:${TTS_PORT}`;
function getTtsBase() {
  if (isRemoteMode()) {
    const origin = getRemoteBackendOrigin();
    if (origin) return `${origin}:${TTS_PORT}`;
  }
  return LOCAL_TTS_BASE;
}
let ttsProcess = null;
let ttsStarting = false;
let ttsLastError = "";
function resolveTtsEngineDir() {
  const active = getTtsEngineDir();
  if (active && node_fs.existsSync(node_path.join(active, "rest_server.py")))
    return active;
  return (
    [
      node_path.join(process.resourcesPath, "engine", "tts"),
      bundledResourcePath("engine", "tts"),
      node_path.resolve(electron.app.getAppPath(), "engine", "tts"),
    ].find((d) => node_fs.existsSync(node_path.join(d, "rest_server.py"))) || ""
  );
}
function resolvePython() {
  const active = getActivePythonPath();
  if (active && node_fs.existsSync(active)) return active;
  const fallback = node_path.join(
    electron.app.getPath("userData"),
    "runtime",
    "venv312",
    "Scripts",
    "python.exe",
  );
  return node_fs.existsSync(fallback) ? fallback : "python";
}
async function probeHealth() {
  try {
    const resp = await fetch(`${getTtsBase()}/health`, {
      signal: AbortSignal.timeout(2500),
    });
    if (resp.ok) return { online: true, data: await resp.json() };
    return { online: false };
  } catch {
    return { online: false };
  }
}
async function getTtsStatus() {
  const { online, data } = await probeHealth();
  if (online && data) {
    return {
      state: "ready",
      port: TTS_PORT,
      device: data.device,
      modelsDir: data.models_dir,
      models: {
        custom_voice: {
          available: data.available?.custom_voice ?? false,
          loaded: data.models?.custom_voice ?? false,
        },
        voice_design: {
          available: data.available?.voice_design ?? false,
          loaded: data.models?.voice_design ?? false,
        },
        voice_clone: {
          available: data.available?.voice_clone ?? false,
          loaded: data.models?.voice_clone ?? false,
        },
      },
    };
  }
  if (ttsStarting)
    return {
      state: "starting",
      port: TTS_PORT,
      message: "语音引擎启动中…",
      models: emptyModels(),
    };
  if (ttsProcess && !ttsProcess.killed) {
    return {
      state: "starting",
      port: TTS_PORT,
      message: "语音引擎启动中…",
      models: emptyModels(),
    };
  }
  if (ttsLastError)
    return {
      state: "error",
      port: TTS_PORT,
      message: ttsLastError,
      models: emptyModels(),
    };
  return { state: "offline", port: TTS_PORT, models: emptyModels() };
}
function emptyModels() {
  return {
    custom_voice: { available: false, loaded: false },
    voice_design: { available: false, loaded: false },
    voice_clone: { available: false, loaded: false },
  };
}
function resolveUvPath() {
  const candidates = [
    node_path.join(process.resourcesPath, "runtime-tools", "uv.exe"),
    bundledResourcePath("runtime-tools", "uv.exe"),
    node_path.resolve(electron.app.getAppPath(), "runtime-tools", "uv.exe"),
  ];
  return candidates.find((p) => node_fs.existsSync(p)) || "";
}
function runCommand$1(cmd, args, options = {}) {
  return new Promise((resolvePromise) => {
    node_child_process.execFile(
      cmd,
      args,
      {
        cwd: options.cwd,
        windowsHide: true,
        timeout: options.timeout,
        encoding: "utf8",
        env: options.env,
      },
      (error, stdout, stderr) => {
        resolvePromise({
          status: error ? (typeof error.code === "number" ? error.code : 1) : 0,
          stdout: String(stdout || ""),
          stderr: String(stderr || ""),
        });
      },
    );
  });
}
function pythonEnv$1(extra = {}) {
  const threads = String(Math.max(2, node_os.cpus().length - 2));
  return {
    ...process.env,
    OMP_NUM_THREADS: threads,
    MKL_NUM_THREADS: threads,
    OPENBLAS_NUM_THREADS: threads,
    NUMEXPR_NUM_THREADS: threads,
    ...extra,
  };
}
async function ensureTtsDeps(python, onLog) {
  const venvScripts = node_path.dirname(python);
  const soxExe = node_path.join(venvScripts, "sox.exe");
  const libSox = node_path.join(venvScripts, "libsox-3.dll");
  if (!node_fs.existsSync(soxExe) || !node_fs.existsSync(libSox)) {
    const comfySources = [
      "G:/ComfyUI-aki-v1.6/python/Scripts",
      node_path.join(process.env.COMFYUI_PATH || "", "python/Scripts"),
      node_path.join(
        node_path.dirname(electron.app.getPath("exe")),
        "python/Scripts",
      ),
    ];
    for (const src of comfySources) {
      const srcSox = node_path.join(src, "sox.exe");
      const srcDll = node_path.join(src, "libsox-3.dll");
      if (node_fs.existsSync(srcSox) && node_fs.existsSync(srcDll)) {
        try {
          if (!node_fs.existsSync(soxExe)) node_fs.copyFileSync(srcSox, soxExe);
          if (!node_fs.existsSync(libSox)) node_fs.copyFileSync(srcDll, libSox);
          onLog?.("[TTS] 已从 ComfyUI 复制 sox.exe + libsox-3.dll 到 venv");
          break;
        } catch {}
      }
    }
  }
  const deps = [
    "flask",
    "flask_cors",
    "soundfile",
    "librosa",
    "einops",
    "sox",
    "onnxruntime",
  ];
  const importStmt = deps.map((d) => `import ${d}`).join("; ");
  const checkResult = await runCommand$1(
    python,
    ["-c", `${importStmt}; print("TTS_DEPS_OK")`],
    {
      cwd: resolveTtsEngineDir(),
      timeout: 3e4,
    },
  );
  if (checkResult.status === 0 && checkResult.stdout.includes("TTS_DEPS_OK")) {
    const tvResult = await runCommand$1(
      python,
      [
        "-c",
        'import transformers; assert transformers.__version__.startswith("4.57"), transformers.__version__',
      ],
      {
        timeout: 15e3,
      },
    );
    if (tvResult.status === 0) return true;
  }
  const uv = resolveUvPath();
  if (!uv) {
    onLog?.("[TTS] 未找到 uv.exe，无法自动安装依赖");
    return false;
  }
  onLog?.("[TTS] TTS 依赖缺失，使用 uv 自动安装…");
  const packages = [
    "flask",
    "flask-cors",
    "soundfile>=0.12.0",
    "librosa>=0.10.0",
    "einops>=0.7.0",
    "sox>=1.4.1",
    "onnxruntime>=1.16.0",
    "transformers==4.57.3",
    "accelerate==1.12.0",
  ];
  const mirrors = [
    "https://pypi.tuna.tsinghua.edu.cn/simple",
    "https://pypi.org/simple",
  ];
  let installed = false;
  for (const mirror of mirrors) {
    onLog?.(`[TTS] 使用镜像 ${mirror} 安装 TTS 依赖…`);
    const result2 = await runCommand$1(
      uv,
      ["pip", "install", "--python", python, ...packages, "-i", mirror],
      {
        cwd: resolveTtsEngineDir(),
        timeout: 3e5,
        env: {
          ...process.env,
          PYTHONUTF8: "1",
          HTTPS_PROXY: "",
          HTTP_PROXY: "",
        },
      },
    );
    if (result2.status === 0) {
      installed = true;
      break;
    }
    onLog?.(`[TTS] 镜像 ${mirror} 安装失败（退出码 ${result2.status}）`);
  }
  if (!installed) {
    onLog?.("[TTS] 所有镜像安装失败");
    return false;
  }
  const verifyResult = await runCommand$1(
    python,
    ["-c", `${importStmt}; print("TTS_DEPS_OK")`],
    {
      cwd: resolveTtsEngineDir(),
      timeout: 15e3,
    },
  );
  if (
    verifyResult.status === 0 &&
    verifyResult.stdout.includes("TTS_DEPS_OK")
  ) {
    onLog?.("[TTS] TTS 依赖安装成功");
    return true;
  }
  onLog?.("[TTS] TTS 依赖验证失败，引擎可能无法启动");
  return false;
}
async function startTts(onLog) {
  if (ttsProcess && !ttsProcess.killed)
    return { ok: true, msg: "语音引擎已在运行" };
  if (ttsStarting) return { ok: true, msg: "语音引擎启动中…" };
  const existing = await probeHealth();
  if (existing.online) return { ok: true, msg: "语音引擎已在运行" };
  const engineDir = resolveTtsEngineDir();
  if (isRemoteMode()) {
    const remoteBase = getTtsBase();
    onLog?.(`[TTS] 远程模式：探测家庭电脑 TTS 服务 ${remoteBase} …`);
    onLog?.(
      `[TTS] 如果长时间未就绪，请确认家庭电脑已启动韵绘软件并开启了语音引擎`,
    );
    const { online } = await probeHealth();
    if (online) {
      onLog?.("[TTS] 远程 TTS 服务已就绪");
      return { ok: true, msg: "已连接家庭电脑的 TTS 服务" };
    }
    return {
      ok: true,
      msg: "正在连接家庭电脑的 TTS 服务（如果家里软件未启动语音引擎，将一直等待）",
    };
  }
  if (!engineDir)
    return { ok: false, msg: "内置语音引擎不存在，请重新安装韵绘" };
  const python = resolvePython();
  if (!python || !node_fs.existsSync(python)) {
    return {
      ok: false,
      msg: "Python 环境未就绪，请先启动视频/图片引擎完成环境安装（点击左侧仪表盘的启动按钮）",
    };
  }
  const modelsDir = audioModelsDir();
  onLog?.(`[TTS] 启动内置语音引擎: ${engineDir}`);
  onLog?.(`[TTS] Python: ${python}`);
  onLog?.(`[TTS] 模型目录: ${modelsDir}`);
  const { existsSync: fs, readdirSync } = await import("node:fs");
  let hasModels = false;
  if (fs(modelsDir)) {
    try {
      for (const entry of readdirSync(modelsDir)) {
        const full = node_path.join(modelsDir, entry);
        if (
          fs(full) &&
          fs(node_path.join(full, "config.json")) &&
          fs(node_path.join(full, "model.safetensors"))
        ) {
          hasModels = true;
          break;
        }
      }
    } catch {}
  }
  if (!hasModels) {
    onLog?.(
      `[TTS] 警告: 模型目录 ${modelsDir} 中未找到 Qwen3-TTS 模型。语音功能将无法使用。`,
    );
    onLog?.(`[TTS] 请将 TTS 模型文件夹放入模型目录的 audio 子文件夹中。`);
  }
  const depsOk = ensureTtsDeps(python, onLog);
  if (!depsOk) {
    return {
      ok: false,
      msg: "TTS Python 依赖安装失败。请先启动视频引擎完成环境安装，再重试语音功能。",
    };
  }
  ttsStarting = true;
  onLog?.("[TTS] 正在卸载本地图片/视频/视觉模型，为语音引擎释放显存…");
  try {
    const { stopVisionReverse: stopVisionReverse2 } =
      await Promise.resolve().then(() => visionReverse);
    await stopVisionReverse2();
  } catch {}
  const { releaseLocalGenerationGpu: releaseLocalGenerationGpu2 } =
    await Promise.resolve().then(() => backend);
  await releaseLocalGenerationGpu2();
  ttsLastError = "";
  onLog?.(
    `[TTS] 监听地址: 0.0.0.0:${TTS_PORT}（允许同局域网设备远程使用语音功能）`,
  );
  try {
    const listenHost = "0.0.0.0";
    const child2 = node_child_process.spawn(
      python,
      [
        "rest_server.py",
        "--port",
        String(TTS_PORT),
        "--host",
        listenHost,
        "--models-dir",
        modelsDir,
      ],
      {
        cwd: engineDir,
        shell: false,
        windowsHide: true,
        env: pythonEnv$1({
          PYTHONUTF8: "1",
          YUNHUI_TTS_MODELS_DIR: modelsDir,
        }),
      },
    );
    ttsProcess = child2;
  } catch (err) {
    ttsStarting = false;
    return {
      ok: false,
      msg: `启动失败: ${err instanceof Error ? err.message : String(err)}`,
    };
  }
  const emit2 = (chunk) => {
    const line = chunk.toString("utf8").trim();
    if (line) onLog?.(line);
  };
  const child = ttsProcess;
  child.stdout.on("data", emit2);
  child.stderr.on("data", emit2);
  child.once("exit", (code) => {
    onLog?.(`[TTS] 引擎进程退出（代码 ${code ?? "未知"}）`);
    if (ttsProcess === child) {
      ttsProcess = null;
      ttsStarting = false;
    }
    if (code !== 0 && code !== null)
      ttsLastError = `语音引擎进程异常退出（代码 ${code}），请检查 TTS 模型是否已放入 audio 文件夹`;
  });
  child.once("error", (err) => {
    onLog?.(`[TTS] 引擎进程错误: ${err.message}`);
    if (ttsProcess === child) {
      ttsProcess = null;
      ttsStarting = false;
    }
    ttsLastError = `语音引擎启动失败：${err.message}`;
  });
  const deadline = Date.now() + 3e5;
  const poll = async () => {
    while (Date.now() < deadline) {
      if (!ttsProcess || ttsProcess.killed) {
        if (ttsLastError) onLog?.(`[TTS] ${ttsLastError}`);
        return;
      }
      await new Promise((r) => setTimeout(r, 2e3));
      const { online } = await probeHealth();
      if (online) {
        ttsStarting = false;
        ttsLastError = "";
        onLog?.("[TTS] 语音引擎已就绪");
        return;
      }
    }
    ttsStarting = false;
    onLog?.("[TTS] 语音引擎启动超时（模型可能仍在加载）");
  };
  void poll();
  return { ok: true, msg: "语音引擎启动中…" };
}
function stopTts() {
  const child = ttsProcess;
  ttsProcess = null;
  ttsStarting = false;
  ttsLastError = "";
  if (child && !child.killed) {
    if (process.platform === "win32" && child.pid) {
      const result2 = node_child_process.spawnSync(
        "taskkill.exe",
        ["/PID", String(child.pid), "/T", "/F"],
        {
          windowsHide: true,
          timeout: 1e4,
          stdio: "ignore",
        },
      );
      if (result2.status !== 0) child.kill();
    } else {
      child.kill();
    }
  }
  return { ok: true };
}
async function unloadTtsModels() {
  try {
    const resp = await fetch(`${getTtsBase()}/unload`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: AbortSignal.timeout(3e4),
    });
    if (!resp.ok) {
      return { ok: false, error: `unload 接口返回 ${resp.status}` };
    }
    const data = await resp.json();
    return data;
  } catch (e) {
    if (!isRemoteMode() && (!ttsProcess || ttsProcess.killed))
      return { ok: true, unloaded: [] };
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}
function saveWavBuffer(buf, outputDir2, prefix) {
  if (!node_fs.existsSync(outputDir2))
    node_fs.mkdirSync(outputDir2, { recursive: true });
  const path = node_path.join(outputDir2, `${prefix}-${Date.now()}.wav`);
  node_fs.writeFileSync(path, buf);
  return { outputPath: path };
}
async function ttsVoiceDesign(request) {
  try {
    const resp = await fetch(`${getTtsBase()}/voice_design`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: request.text,
        lang: request.lang || "zh",
        design: request.design,
      }),
      signal: AbortSignal.timeout(12e4),
    });
    if (!resp.ok) return { error: await resp.text() };
    const buf = Buffer.from(await resp.arrayBuffer());
    return saveWavBuffer(buf, request.outputDir, "tts-design");
  } catch (e) {
    return { error: e instanceof Error ? e.message : String(e) };
  }
}
const tts = /* @__PURE__ */ Object.freeze(
  /* @__PURE__ */ Object.defineProperty(
    {
      __proto__: null,
      getTtsStatus,
      startTts,
      stopTts,
      ttsVoiceDesign,
      unloadTtsModels,
    },
    Symbol.toStringTag,
    { value: "Module" },
  ),
);
const PORT$1 = 7862;
const BASE_URL = `http://127.0.0.1:${PORT$1}`;
let indexProcess = null;
let starting = false;
let lastError = "";
function pythonThreadCap() {
  return Math.max(2, node_os.cpus().length - 2);
}
function pythonEnv(extra = {}) {
  const threads = String(pythonThreadCap());
  return {
    ...process.env,
    OMP_NUM_THREADS: threads,
    MKL_NUM_THREADS: threads,
    OPENBLAS_NUM_THREADS: threads,
    NUMEXPR_NUM_THREADS: threads,
    ...extra,
  };
}
function runCommand(cmd, args, options = {}) {
  return new Promise((resolvePromise) => {
    node_child_process.execFile(
      cmd,
      args,
      {
        cwd: options.cwd,
        windowsHide: true,
        timeout: options.timeout,
        encoding: "utf8",
      },
      (error, stdout, stderr) => {
        resolvePromise({
          status: error ? (typeof error.code === "number" ? error.code : 1) : 0,
          stdout: String(stdout || ""),
          stderr: String(stderr || ""),
        });
      },
    );
  });
}
function sourceDir() {
  return (
    [
      node_path.join(process.resourcesPath, "engine", "indextts"),
      bundledResourcePath("engine", "indextts"),
      node_path.resolve(electron.app.getAppPath(), "engine", "indextts"),
    ].find((path) =>
      node_fs.existsSync(node_path.join(path, "indextts", "infer_v2_5.py")),
    ) || ""
  );
}
function serverDir() {
  return (
    [
      node_path.join(process.resourcesPath, "engine", "indextts-server"),
      bundledResourcePath("engine", "indextts-server"),
      node_path.resolve(electron.app.getAppPath(), "engine", "indextts-server"),
    ].find((path) =>
      node_fs.existsSync(node_path.join(path, "rest_server.py")),
    ) || ""
  );
}
function uvPath() {
  return (
    [
      node_path.join(process.resourcesPath, "runtime-tools", "uv.exe"),
      bundledResourcePath("runtime-tools", "uv.exe"),
      node_path.resolve(electron.app.getAppPath(), "runtime-tools", "uv.exe"),
    ].find(node_fs.existsSync) || ""
  );
}
function venvDir() {
  return node_path.join(
    electron.app.getPath("userData"),
    "runtime",
    "venv_indextts25",
  );
}
function dedicatedPythonPath() {
  return node_path.join(venvDir(), "Scripts", "python.exe");
}
function pythonCandidates() {
  return [
    dedicatedPythonPath(),
    // 兼容开发期已存在且通过自检的独立 3.11 CUDA 环境；正式安装仍使用上面的专用目录。
    node_path.join(
      electron.app.getPath("userData"),
      "runtime",
      "venv311",
      "Scripts",
      "python.exe",
    ),
  ];
}
const MODEL_FILES = [
  "config.yaml",
  "gpt.pth",
  "codec.pth",
  "s2mel.pth",
  "feat1.pt",
  "feat2.pt",
  "wav2vec2bert_stats.pt",
  "multilingual_zh_ja_yue_char_del.tiktoken",
];
function isCompleteModelDir(path) {
  return (
    MODEL_FILES.every((file) =>
      node_fs.existsSync(node_path.join(path, file)),
    ) &&
    node_fs.existsSync(
      node_path.join(path, "hf_cache", "campplus_cn_common.bin"),
    ) &&
    node_fs.existsSync(
      node_path.join(path, "hf_cache", "bigvgan", "bigvgan_generator.pt"),
    ) &&
    node_fs.existsSync(
      node_path.join(path, "hf_cache", "w2v-bert-2.0", "model.safetensors"),
    )
  );
}
function modelDir() {
  const base2 = audioModelsDir();
  const candidates = [node_path.join(base2, "IndexTTS-2.5"), base2];
  return candidates.find(isCompleteModelDir) || "";
}
async function probe() {
  try {
    const response = await fetch(`${BASE_URL}/health`, {
      signal: AbortSignal.timeout(2500),
    });
    if (!response.ok) return null;
    const data = await response.json();
    if (data.service !== "yunhui-indextts-2.5") return null;
    return {
      state: data.engine_error
        ? "error"
        : data.engine_loading
          ? "starting"
          : "ready",
      port: PORT$1,
      modelDir: data.models_dir || modelDir(),
      modelAvailable: Boolean(data.models_available),
      loaded: Boolean(data.engine_loaded),
      message: data.engine_error || void 0,
    };
  } catch {
    return null;
  }
}
async function getIndexTtsStatus() {
  const online = await probe();
  if (online) return online;
  return {
    state: lastError
      ? "error"
      : starting || (indexProcess && !indexProcess.killed)
        ? "starting"
        : "offline",
    port: PORT$1,
    modelDir: modelDir(),
    modelAvailable: Boolean(modelDir()),
    loaded: false,
    message: lastError || void 0,
  };
}
async function validateRuntime(python) {
  if (!node_fs.existsSync(python)) return false;
  const result2 = await runCommand(
    python,
    [
      "-c",
      'import sys, torch, flask, omegaconf, transformers, soundfile, wetext; assert sys.version_info[:2] == (3, 11); assert transformers.__version__.startswith("4.52."); print(torch.cuda.is_available())',
    ],
    {
      cwd: sourceDir(),
      timeout: 3e4,
    },
  );
  return result2.status === 0 && result2.stdout.includes("True");
}
async function installServerDependencies(uv, python, onLog) {
  onLog?.("[IndexTTS] 正在补齐内置 REST 服务依赖…");
  const result2 = await runCommand(
    uv,
    ["pip", "install", "--python", python, "flask>=3.0", "flask-cors>=5.0"],
    {
      cwd: sourceDir(),
      timeout: 5 * 6e4,
    },
  );
  const detail = `${result2.stdout || ""}
${result2.stderr || ""}`.trim();
  if (detail) onLog?.(`[IndexTTS] ${detail}`);
  if (result2.status !== 0)
    throw new Error(
      `IndexTTS REST 服务依赖安装失败${detail ? `：${detail.slice(-500)}` : ""}`,
    );
}
async function pythonPath() {
  for (const candidate of pythonCandidates()) {
    if (await validateRuntime(candidate)) return candidate;
  }
  return dedicatedPythonPath();
}
async function ensureRuntime(onLog) {
  for (const candidate of pythonCandidates()) {
    if (await validateRuntime(candidate)) return;
  }
  const uv = uvPath();
  const source = sourceDir();
  if (!uv || !source) throw new Error("IndexTTS 内置源码或 uv.exe 不完整");
  if (node_fs.existsSync(dedicatedPythonPath())) {
    const core = await runCommand(
      dedicatedPythonPath(),
      [
        "-c",
        'import sys, torch, omegaconf, transformers, soundfile, wetext; assert sys.version_info[:2] == (3, 11); assert torch.cuda.is_available(); assert transformers.__version__.startswith("4.52.")',
      ],
      {
        cwd: source,
        timeout: 3e4,
      },
    );
    if (core.status === 0) {
      await installServerDependencies(uv, dedicatedPythonPath(), onLog);
      if (await validateRuntime(dedicatedPythonPath())) return;
    }
  }
  node_fs.mkdirSync(node_path.dirname(venvDir()), { recursive: true });
  onLog?.(
    "[IndexTTS] 首次安装独立 Python 3.11 + CUDA 运行环境，所需时间取决于网络速度…",
  );
  await new Promise((resolvePromise, reject) => {
    const child = node_child_process.spawn(
      uv,
      [
        "sync",
        "--project",
        source,
        "--no-dev",
        "--no-install-project",
        "--python",
        "3.11",
        "--default-index",
        "https://mirrors.aliyun.com/pypi/simple",
      ],
      {
        cwd: source,
        windowsHide: true,
        env: pythonEnv({
          UV_PROJECT_ENVIRONMENT: venvDir(),
          PYTHONUTF8: "1",
          UV_PYTHON_INSTALL_MIRROR: uvPythonInstallMirror(),
        }),
      },
    );
    const emit2 = (chunk) => {
      const line = chunk.toString("utf8").trim();
      if (line) onLog?.(`[IndexTTS] ${line}`);
    };
    child.stdout.on("data", emit2);
    child.stderr.on("data", emit2);
    child.once("error", reject);
    child.once("exit", (code) =>
      code === 0
        ? resolvePromise()
        : reject(
            new Error(`IndexTTS 运行环境安装失败（代码 ${code ?? "未知"}）`),
          ),
    );
  });
  await installServerDependencies(uv, dedicatedPythonPath(), onLog);
  if (!(await validateRuntime(dedicatedPythonPath()))) {
    const diagnostic = await runCommand(
      dedicatedPythonPath(),
      [
        "-c",
        "import sys, torch, flask, flask_cors, omegaconf, transformers, soundfile, wetext; print(sys.version); print(torch.__version__, torch.cuda.is_available(), transformers.__version__)",
      ],
      {
        cwd: source,
        timeout: 3e4,
      },
    );
    throw new Error(
      `IndexTTS 环境自检失败：${(diagnostic.stderr || diagnostic.stdout || "未返回诊断信息").trim().slice(-800)}`,
    );
  }
}
async function startIndexTts(onLog) {
  const existing = await probe();
  if (existing?.state === "ready")
    return { ok: true, msg: "IndexTTS 已在运行" };
  if (starting) {
    const deadline = Date.now() + 18e4;
    while (Date.now() < deadline) {
      await new Promise((resolvePromise) => setTimeout(resolvePromise, 1e3));
      const status = await probe();
      if (status?.state === "ready")
        return { ok: true, msg: "IndexTTS 已就绪" };
      if (status?.state === "error")
        return { ok: false, msg: status.message || "IndexTTS 启动失败" };
      if (!indexProcess) break;
    }
    return {
      ok: false,
      msg: "IndexTTS 模型加载超时（8G 显存机器首次加载可能较慢，请检查引擎日志）",
    };
  }
  const models = modelDir();
  if (!models)
    return {
      ok: false,
      msg: `未找到完整 IndexTTS-2.5 模型，请放到 ${node_path.join(audioModelsDir(), "IndexTTS-2.5")}`,
    };
  const server = serverDir();
  const source = sourceDir();
  if (!server || !source)
    return { ok: false, msg: "IndexTTS 内置引擎文件不完整" };
  starting = true;
  lastError = "";
  try {
    await ensureRuntime(onLog);
    onLog?.(
      "[IndexTTS] 正在卸载本地图片/视频/视觉/语音模型，为克隆引擎释放显存…",
    );
    try {
      const { stopVisionReverse: stopVisionReverse2 } =
        await Promise.resolve().then(() => visionReverse);
      await stopVisionReverse2();
    } catch {}
    const { releaseLocalGenerationGpu: releaseLocalGenerationGpu2 } =
      await Promise.resolve().then(() => backend);
    await releaseLocalGenerationGpu2();
    const child = node_child_process.spawn(
      await pythonPath(),
      [
        node_path.join(server, "rest_server.py"),
        "--port",
        String(PORT$1),
        "--host",
        "127.0.0.1",
        "--model-dir",
        models,
      ],
      {
        cwd: source,
        shell: false,
        windowsHide: true,
        env: pythonEnv({
          PYTHONUTF8: "1",
          YUNHUI_INDEXTTS_SOURCE_DIR: source,
          YUNHUI_INDEXTTS_MODELS_DIR: models,
          // kaldifst 在 Windows 上不能读取含中文字符的 FST 路径，服务会将其缓存到此纯英文目录。
          YUNHUI_INDEXTTS_CACHE_DIR: node_path.join(
            electron.app.getPath("temp"),
            "YUH-Studio-IndexTTS",
          ),
        }),
      },
    );
    indexProcess = child;
    const emit2 = (chunk) => {
      const line = chunk.toString("utf8").trim();
      if (line) onLog?.(line);
    };
    child.stdout.on("data", emit2);
    child.stderr.on("data", emit2);
    child.once("exit", (code) => {
      if (indexProcess === child) indexProcess = null;
      starting = false;
      if (code !== 0 && code !== null)
        lastError = `IndexTTS 进程异常退出（代码 ${code}）`;
    });
    child.once("error", (error) => {
      if (indexProcess === child) indexProcess = null;
      starting = false;
      lastError = error.message;
    });
    const deadline = Date.now() + 18e4;
    while (Date.now() < deadline) {
      await new Promise((resolvePromise) => setTimeout(resolvePromise, 1e3));
      const status = await probe();
      if (status?.state === "ready") {
        starting = false;
        return { ok: true, msg: "IndexTTS 已就绪" };
      }
      if (status?.state === "error")
        throw new Error(status.message || "IndexTTS 引擎加载失败");
      if (!indexProcess) break;
    }
    throw new Error(
      lastError ||
        "IndexTTS 模型加载超时（8G 显存机器首次加载可能较慢，请检查引擎日志）",
    );
  } catch (error) {
    starting = false;
    lastError = error instanceof Error ? error.message : String(error);
    stopIndexTts();
    return { ok: false, msg: lastError };
  }
}
function stopIndexTts() {
  const child = indexProcess;
  indexProcess = null;
  starting = false;
  if (child && !child.killed) {
    if (process.platform === "win32" && child.pid) {
      const result2 = node_child_process.spawnSync(
        "taskkill.exe",
        ["/PID", String(child.pid), "/T", "/F"],
        { windowsHide: true, timeout: 1e4, stdio: "ignore" },
      );
      if (result2.status !== 0) child.kill();
    } else child.kill();
  }
  return { ok: true };
}
async function unloadIndexTts() {
  try {
    const response = await fetch(`${BASE_URL}/unload`, {
      method: "POST",
      signal: AbortSignal.timeout(3e4),
    });
    return response.ok
      ? { ok: true }
      : { ok: false, error: `unload 接口返回 ${response.status}` };
  } catch {
    return !indexProcess || indexProcess.killed
      ? { ok: true }
      : { ok: false, error: "IndexTTS 服务无法连接" };
  }
}
async function indexTtsClone(request) {
  const started = await startIndexTts();
  if (!started.ok) return { error: started.msg };
  try {
    const response = await fetch(`${BASE_URL}/clone`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: request.text,
        ref_audio: request.refAudioPath,
        lang: request.lang || "zh",
        output_dir: request.outputDir,
        emo_audio: request.emotionAudioPath,
        emo_alpha: request.emotionAlpha ?? 0.8,
        duration_factor: request.durationFactor ?? 1,
      }),
      signal: AbortSignal.timeout(3e5),
    });
    if (!response.ok) return { error: await response.text() };
    const outputPath = response.headers.get("x-output-path");
    if (outputPath && node_fs.existsSync(outputPath)) return { outputPath };
    return { error: "IndexTTS 返回成功但没有输出路径" };
  } catch (error) {
    return { error: error instanceof Error ? error.message : String(error) };
  }
}
function indexTtsModelLabel() {
  const path = modelDir();
  return path ? node_path.basename(path) : void 0;
}
const indexTts = /* @__PURE__ */ Object.freeze(
  /* @__PURE__ */ Object.defineProperty(
    {
      __proto__: null,
      getIndexTtsStatus,
      indexTtsClone,
      indexTtsModelLabel,
      startIndexTts,
      stopIndexTts,
      unloadIndexTts,
    },
    Symbol.toStringTag,
    { value: "Module" },
  ),
);
const PORT = 8191;
const HOST = `http://127.0.0.1:${PORT}`;
function getVisionHost() {
  if (isRemoteMode()) {
    const origin = getRemoteBackendOrigin();
    if (origin) {
      try {
        const url = new URL(origin);
        return `${url.protocol}//${url.hostname}:${PORT}`;
      } catch {}
    }
  }
  return HOST;
}
async function requestRemoteVisionStart() {
  const origin = getRemoteBackendOrigin();
  if (!origin) return;
  try {
    await fetch(`${origin}/vision/start`, {
      method: "POST",
      signal: AbortSignal.timeout(1e4),
    });
  } catch {}
}
const SETTINGS_FILE = () =>
  node_path.join(
    electron.app.getPath("userData"),
    "vision-reverse-settings.json",
  );
const TEMPLATES_FILE = () =>
  node_path.join(
    electron.app.getPath("userData"),
    "vision-reverse-templates.json",
  );
const DEFAULT_SETTINGS = {
  modelPath: "",
  mmprojPath: "",
  contextSize: 32768,
  maxTokens: 2048,
  temperature: 0.2,
  topP: 0.9,
  topK: 40,
  minP: 0.05,
  repeatPenalty: 1.05,
  seed: -1,
  gpuLayers: -1,
  flashAttention: true,
  cacheTypeK: "q8_0",
  cacheTypeV: "q8_0",
  batchSize: 2048,
  microBatchSize: 512,
  threads: Math.max(
    4,
    Math.min(16, (Number(process.env.NUMBER_OF_PROCESSORS) || 8) - 2),
  ),
  reasoning: false,
  reasoningBudget: 0,
  videoFrames: 8,
  imageMaxEdge: 1280,
  imageMaxTokens: 2048,
};
let processRef = null;
let state = "stopped";
let message = "视觉反推引擎未启动";
let activeModelPath = "";
let activeSignature = "";
let version = "";
const activeRequests = /* @__PURE__ */ new Map();
const logListeners = /* @__PURE__ */ new Set();
function emit(line) {
  const text = line.trim();
  if (!text) return;
  for (const listener of logListeners) listener(text);
}
function clamp(value, fallback, min, max) {
  const number = Number(value);
  return Number.isFinite(number)
    ? Math.max(min, Math.min(max, number))
    : fallback;
}
function normalizeSettings(input = {}) {
  const merged = { ...DEFAULT_SETTINGS, ...input };
  return {
    ...merged,
    providerId: merged.providerId ? String(merged.providerId) : void 0,
    providerModel: merged.providerModel ? String(merged.providerModel) : void 0,
    modelPath: String(merged.modelPath || ""),
    mmprojPath: String(merged.mmprojPath || ""),
    contextSize: Math.round(clamp(merged.contextSize, 32768, 2048, 131072)),
    maxTokens: Math.round(clamp(merged.maxTokens, 2048, 64, 16384)),
    temperature: clamp(merged.temperature, 0.2, 0, 2),
    topP: clamp(merged.topP, 0.9, 0.01, 1),
    topK: Math.round(clamp(merged.topK, 40, 0, 200)),
    minP: clamp(merged.minP, 0.05, 0, 1),
    repeatPenalty: clamp(merged.repeatPenalty, 1.05, 0.5, 2),
    seed: Math.round(clamp(merged.seed, -1, -1, 2147483647)),
    gpuLayers: Math.round(clamp(merged.gpuLayers, -1, -1, 999)),
    batchSize: Math.round(clamp(merged.batchSize, 2048, 32, 4096)),
    microBatchSize: Math.round(clamp(merged.microBatchSize, 512, 32, 2048)),
    threads: Math.round(clamp(merged.threads, DEFAULT_SETTINGS.threads, 1, 64)),
    reasoningBudget: Math.round(clamp(merged.reasoningBudget, 0, -1, 16384)),
    videoFrames: Math.round(clamp(merged.videoFrames, 8, 2, 24)),
    imageMaxEdge: Math.round(clamp(merged.imageMaxEdge, 1280, 448, 2048)),
    imageMaxTokens: Math.round(clamp(merged.imageMaxTokens, 2048, 256, 8192)),
    flashAttention: Boolean(merged.flashAttention),
    reasoning: Boolean(merged.reasoning),
    cacheTypeK: ["f16", "q8_0", "q4_0"].includes(merged.cacheTypeK)
      ? merged.cacheTypeK
      : "q8_0",
    cacheTypeV: ["f16", "q8_0", "q4_0"].includes(merged.cacheTypeV)
      ? merged.cacheTypeV
      : "q8_0",
  };
}
function getVisionReverseSettings() {
  try {
    return normalizeSettings(
      JSON.parse(node_fs.readFileSync(SETTINGS_FILE(), "utf8")),
    );
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}
function saveVisionReverseSettings(input) {
  const next = normalizeSettings({ ...getVisionReverseSettings(), ...input });
  node_fs.mkdirSync(node_path.dirname(SETTINGS_FILE()), { recursive: true });
  node_fs.writeFileSync(SETTINGS_FILE(), JSON.stringify(next, null, 2), "utf8");
  return next;
}
function validTemplate(value) {
  if (!value || typeof value !== "object") return false;
  const item = value;
  return (
    typeof item.id === "string" &&
    Boolean(item.id.trim()) &&
    typeof item.name === "string" &&
    Boolean(item.name.trim()) &&
    typeof item.prompt === "string" &&
    Boolean(item.prompt.trim())
  );
}
function loadVisionReverseTemplates() {
  try {
    const value = JSON.parse(node_fs.readFileSync(TEMPLATES_FILE(), "utf8"));
    return Array.isArray(value) ? value.filter(validTemplate) : [];
  } catch {
    return [];
  }
}
function saveVisionReverseTemplates(input) {
  if (!Array.isArray(input)) throw new Error("反推预设格式无效");
  const templates = input.filter(validTemplate).map((item) => ({
    id: item.id.trim(),
    name: item.name.trim(),
    prompt: item.prompt.trim(),
  }));
  if (templates.length !== input.length)
    throw new Error("反推预设包含空名称或空内容");
  if (new Set(templates.map((item) => item.id)).size !== templates.length)
    throw new Error("反推预设 ID 重复");
  node_fs.mkdirSync(node_path.dirname(TEMPLATES_FILE()), { recursive: true });
  node_fs.writeFileSync(
    TEMPLATES_FILE(),
    JSON.stringify(templates, null, 2),
    "utf8",
  );
  return templates;
}
function scanGgufs(root) {
  if (!root || !node_fs.existsSync(root)) return [];
  const results = [];
  const visit = (dir, depth) => {
    if (depth > 4 || results.length > 300) return;
    let entries;
    try {
      entries = node_fs.readdirSync(dir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const entry of entries) {
      const path = node_path.join(dir, entry.name);
      if (entry.isDirectory()) visit(path, depth + 1);
      else if (
        entry.isFile() &&
        node_path.extname(entry.name).toLowerCase() === ".gguf"
      )
        results.push(path);
    }
  };
  visit(root, 0);
  return results;
}
function discoverVisionModels() {
  const files = scanGgufs(getWorkspaceSettings().modelsDir);
  const projectors = files.filter((path) =>
    /(?:mmproj|vision[-_ ]?projector)/i.test(node_path.basename(path)),
  );
  return files
    .filter((path) => !projectors.includes(path))
    .map((path) => {
      const localProjector =
        projectors.find(
          (candidate) =>
            node_path.dirname(candidate).toLowerCase() ===
            node_path.dirname(path).toLowerCase(),
        ) ||
        projectors.find((candidate) =>
          node_path
            .dirname(path)
            .toLowerCase()
            .startsWith(node_path.dirname(candidate).toLowerCase()),
        );
      return {
        name: node_path.basename(path),
        path,
        size: node_fs.statSync(path).size,
        mmprojPath: localProjector,
      };
    })
    .filter((model) => model.mmprojPath)
    .sort((a, b) => b.size - a.size);
}
function runtimeDir() {
  const candidates = [
    node_path.join(process.resourcesPath, "llama.cpp"),
    bundledResourcePath("llama.cpp"),
    node_path.join(electron.app.getAppPath(), "resources", "llama.cpp"),
  ];
  return candidates.find((candidate) => node_fs.existsSync(candidate)) || candidates[0];
}
function serverExe() {
  const bundled = node_path.join(runtimeDir(), "llama-server.exe");
  if (!node_fs.existsSync(bundled))
    throw new Error(`缺少内置 llama.cpp 运行时：${bundled}`);
  return bundled;
}
function signature(settings) {
  return JSON.stringify([
    settings.modelPath,
    settings.mmprojPath,
    settings.contextSize,
    settings.gpuLayers,
    settings.flashAttention,
    settings.cacheTypeK,
    settings.cacheTypeV,
    settings.batchSize,
    settings.microBatchSize,
    settings.threads,
    settings.reasoning,
    settings.reasoningBudget,
    settings.imageMaxTokens,
  ]);
}
async function healthy() {
  try {
    return (
      await fetch(`${getVisionHost()}/health`, {
        signal: AbortSignal.timeout(2500),
      })
    ).ok;
  } catch {
    return false;
  }
}
async function stopVisionReverse() {
  for (const controller of activeRequests.values()) controller.abort();
  activeRequests.clear();
  const child = processRef;
  processRef = null;
  if (child && !child.killed) {
    child.kill();
    await new Promise((resolve) => setTimeout(resolve, 400));
    if (!child.killed) child.kill("SIGKILL");
  }
  state = "stopped";
  message = "视觉反推引擎未启动";
  activeModelPath = "";
  activeSignature = "";
}
async function startVisionReverse(input, onLog) {
  const requested = saveVisionReverseSettings(input || {});
  if (requested.providerId && requested.providerId !== "local-qwen38") {
    state = "ready";
    message = `使用本地服务：${requested.providerId}`;
    return getVisionReverseStatus();
  }
  if (isRemoteMode()) {
    const base2 = getVisionHost();
    if (onLog) logListeners.add(onLog);
    emit(`远程模式：使用家庭电脑的视觉反推引擎 ${base2}`);
    if (await healthy()) {
      state = "ready";
      message = "已连接家庭电脑的视觉反推引擎";
      return getVisionReverseStatus();
    }
    emit("家庭电脑视觉引擎未运行，正在远程触发启动（家里会自动加载模型）…");
    await requestRemoteVisionStart();
    const deadline2 = Date.now() + 24e4;
    while (Date.now() < deadline2) {
      if (await healthy()) {
        state = "ready";
        message = "已连接家庭电脑的视觉反推引擎";
        emit("远程视觉反推引擎已就绪");
        return getVisionReverseStatus();
      }
      await new Promise((resolve) => setTimeout(resolve, 3e3));
    }
    throw new Error(
      "家庭电脑的视觉反推引擎未就绪：请确认家里韵绘已开启共享、模型目录中有带 mmproj 的视觉 GGUF，且家庭电脑 GPU 显存足够",
    );
  }
  const ownership = requestGpuOwnership("vision");
  if (onLog) logListeners.add(onLog);
  const discovered = discoverVisionModels();
  const saved = saveVisionReverseSettings(input || {});
  const persisted = saved.modelPath
    ? discovered.find((item) => item.path === saved.modelPath)
    : void 0;
  const selected = persisted ?? discovered[0];
  if (!selected) throw new Error("模型目录中未找到带 mmproj 的视觉 GGUF 模型");
  if (saved.modelPath && !persisted)
    emit(
      `已保存的模型路径不存在（目录可能被重命名），自动改用 ${node_path.basename(selected.path)}`,
    );
  const settings = saveVisionReverseSettings({
    ...saved,
    modelPath: selected.path,
    // 优先沿用仍在磁盘上的投影模型；旧目录整体改名后改用重新配对的 mmproj
    mmprojPath:
      (saved.mmprojPath &&
        node_fs.existsSync(saved.mmprojPath) &&
        saved.mmprojPath) ||
      selected.mmprojPath ||
      "",
  });
  if (!node_fs.existsSync(settings.mmprojPath))
    throw new Error("未找到视觉投影模型 mmproj，请把它与主 GGUF 放在同一目录");
  if (node_fs.statSync(settings.modelPath).size < 1024 * 1024)
    throw new Error(
      `视觉模型文件异常或不完整：${node_path.basename(settings.modelPath)}`,
    );
  if (node_fs.statSync(settings.mmprojPath).size < 1024)
    throw new Error(
      `视觉投影模型文件异常或不完整：${node_path.basename(settings.mmprojPath)}`,
    );
  const nextSignature = signature(settings);
  if (processRef && activeSignature === nextSignature && (await healthy()))
    return getVisionReverseStatus();
  await stopVisionReverse();
  emit("正在卸载 H3 / Krea2 / TTS，准备视觉模型显存…");
  const { releaseLocalGenerationGpu: releaseLocalGenerationGpu2 } =
    await Promise.resolve().then(() => backend);
  await releaseLocalGenerationGpu2();
  assertGpuOwnership("vision", ownership);
  state = "starting";
  message = `正在加载 ${node_path.basename(settings.modelPath)}`;
  const args = [
    "-m",
    settings.modelPath,
    "-mm",
    settings.mmprojPath,
    "--host",
    // 监听 0.0.0.0 而非 127.0.0.1：与 TTS（7861）一致，允许局域网内
    // 远程连接的公司电脑直接调用家里的视觉反推推理；不应把 8191 映射到公网。
    "0.0.0.0",
    "--port",
    String(PORT),
    "-c",
    String(settings.contextSize),
    "-ngl",
    settings.gpuLayers < 0 ? "all" : String(settings.gpuLayers),
    "-fa",
    settings.flashAttention ? "on" : "off",
    "-ctk",
    settings.cacheTypeK,
    "-ctv",
    settings.cacheTypeV,
    "-b",
    String(settings.batchSize),
    "-ub",
    String(settings.microBatchSize),
    "-t",
    String(settings.threads),
    "--parallel",
    "1",
    "--cont-batching",
    "--jinja",
    "--reasoning",
    settings.reasoning ? "on" : "off",
    "--reasoning-budget",
    String(settings.reasoning ? settings.reasoningBudget : 0),
    "--image-min-tokens",
    "1024",
    "--image-max-tokens",
    String(settings.imageMaxTokens),
  ];
  const child = node_child_process.spawn(serverExe(), args, {
    cwd: runtimeDir(),
    windowsHide: true,
    stdio: ["pipe", "pipe", "pipe"],
  });
  processRef = child;
  let processOutputTail = "";
  const captureOutput = (chunk) => {
    const text = chunk.toString("utf8");
    processOutputTail = `${processOutputTail}${text}`.slice(-4e3);
    emit(text);
  };
  child.stdout.on("data", captureOutput);
  child.stderr.on("data", captureOutput);
  child.once("close", (code) => {
    if (processRef !== child) return;
    processRef = null;
    state = code === 0 ? "stopped" : "error";
    message =
      code === 0
        ? "视觉反推引擎已停止"
        : `llama.cpp 异常退出 (${code ?? "未知"})${processOutputTail.trim() ? `：${processOutputTail.trim().slice(-1200)}` : "。请查看引擎日志"}`;
    if (code !== 0 && processOutputTail.trim())
      emit(`llama.cpp 退出诊断：${processOutputTail.trim().slice(-1200)}`);
  });
  child.once("error", (error) => {
    state = "error";
    message = error.message;
    emit(error.message);
  });
  activeModelPath = settings.modelPath;
  activeSignature = nextSignature;
  const deadline = Date.now() + 18e4;
  while (Date.now() < deadline) {
    if (await healthy()) {
      state = "ready";
      message = `已加载 ${node_path.basename(settings.modelPath)}`;
      return getVisionReverseStatus();
    }
    if (getVisionReverseStatus().state === "error" || !processRef)
      throw new Error(message);
    await new Promise((resolve) => setTimeout(resolve, 800));
  }
  await stopVisionReverse();
  throw new Error("视觉模型加载超时，请检查显存与引擎日志");
}
function getVisionReverseStatus() {
  return {
    state,
    message,
    port: PORT,
    version,
    activeModelPath,
    activeRequestIds: [...activeRequests.keys()],
    models: discoverVisionModels(),
    settings: getVisionReverseSettings(),
  };
}
function onVisionReverseLog(listener) {
  logListeners.add(listener);
  return () => logListeners.delete(listener);
}
async function runProcess(exe, args) {
  await new Promise((resolve, reject) => {
    const child = node_child_process.spawn(exe, args, { windowsHide: true });
    let stderr = "";
    child.stderr.on("data", (chunk) => {
      stderr += chunk.toString("utf8");
    });
    child.once("error", reject);
    child.once("exit", (code) =>
      code === 0
        ? resolve()
        : reject(
            new Error(stderr.trim() || `媒体处理失败 (${code ?? "未知"})`),
          ),
    );
  });
}
async function prepareImages(request, settings) {
  const requestToken = (request.requestId || node_crypto.randomUUID()).replace(
    /[<>:"/\\|?*\x00-\x1F]/g,
    "_",
  );
  const temp = node_path.join(
    electron.app.getPath("temp"),
    `yunhui-vision-${requestToken}`,
  );
  node_fs.mkdirSync(temp, { recursive: true });
  if (request.mediaKind === "image") {
    const target = node_path.join(temp, "image.jpg");
    await sharp(request.mediaPath)
      .rotate()
      .resize({
        width: settings.imageMaxEdge,
        height: settings.imageMaxEdge,
        fit: "inside",
        withoutEnlargement: true,
      })
      .jpeg({ quality: 88, mozjpeg: true })
      .toFile(target);
    return { files: [target], cleanup: temp };
  }
  const meta = await getVideoMeta(request.mediaPath);
  if (!meta.duration) throw new Error("无法读取视频时长");
  const output = node_path.join(temp, "frame-%03d.jpg");
  const fps = Math.max(1e-4, settings.videoFrames / meta.duration);
  await runProcess(await findFfmpeg(), [
    "-hide_banner",
    "-loglevel",
    "error",
    "-i",
    request.mediaPath,
    "-vf",
    `fps=${fps},scale=${settings.imageMaxEdge}:${settings.imageMaxEdge}:force_original_aspect_ratio=decrease`,
    "-frames:v",
    String(settings.videoFrames),
    "-q:v",
    "3",
    output,
  ]);
  const files = node_fs
    .readdirSync(temp)
    .filter((name) => /^frame-\d+\.jpg$/i.test(name))
    .sort()
    .map((name) => node_path.join(temp, name));
  if (!files.length) throw new Error("视频抽帧失败，没有得到可分析画面");
  return { files, cleanup: temp };
}
function asDataUrl(path) {
  return `data:image/jpeg;base64,${node_fs.readFileSync(path).toString("base64")}`;
}
async function reverseMedia(request, onLog) {
  if (!request.requestId) throw new Error("反推请求缺少 requestId");
  if (!request.prompt.trim()) throw new Error("请输入反推模板或要求");
  if (!node_fs.existsSync(request.mediaPath))
    throw new Error(`媒体文件不存在：${request.mediaPath}`);
  if (activeRequests.has(request.requestId))
    throw new Error("这个反推请求正在运行");
  const settings = saveVisionReverseSettings({
    ...getVisionReverseSettings(),
    ...(request.settings || {}),
  });
  if (settings.providerId && settings.providerId !== "local-qwen38") {
    const started2 = Date.now();
    const prepared = await prepareImages(request, settings);
    try {
      const result2 = await sendVisionChat({
        providerId: settings.providerId,
        model: settings.providerModel || "qwen3-vl:8b",
        prompt: request.prompt,
        imagePaths: prepared.files,
      });
      return {
        requestId: request.requestId,
        content: result2.content,
        frameCount: prepared.files.length,
        elapsedMs: Date.now() - started2,
        promptTokens: result2.usage?.promptTokens,
        completionTokens: result2.usage?.completionTokens,
      };
    } finally {
      if (prepared.cleanup)
        try {
          node_fs.rmSync(prepared.cleanup, { recursive: true, force: true });
        } catch {}
    }
  }
  await startVisionReverse(settings, onLog);
  const controller = new AbortController();
  activeRequests.set(request.requestId, controller);
  const started = Date.now();
  let cleanup;
  try {
    const prepared = await prepareImages(request, settings);
    cleanup = prepared.cleanup;
    const content = [{ type: "text", text: request.prompt }];
    prepared.files.forEach((path, index) => {
      if (request.mediaKind === "video")
        content.push({
          type: "text",
          text: `视频关键帧 ${index + 1}/${prepared.files.length}`,
        });
      content.push({ type: "image_url", image_url: { url: asDataUrl(path) } });
    });
    const response = await fetch(`${getVisionHost()}/v1/chat/completions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
      body: JSON.stringify({
        // 远程模式时模型在家里，本地 modelPath 为空；llama-server 不校验该字段名
        model: settings.modelPath
          ? node_path.basename(settings.modelPath)
          : "remote",
        messages: [{ role: "user", content }],
        max_tokens: settings.maxTokens,
        temperature: settings.temperature,
        top_p: settings.topP,
        top_k: settings.topK,
        min_p: settings.minP,
        repeat_penalty: settings.repeatPenalty,
        seed: settings.seed,
        stream: false,
        chat_template_kwargs: { enable_thinking: settings.reasoning },
        reasoning_budget: settings.reasoning ? settings.reasoningBudget : 0,
      }),
    });
    const payload = await response.json();
    if (!response.ok)
      throw new Error(
        payload?.error?.message ||
          payload?.message ||
          `llama.cpp 请求失败 (${response.status})`,
      );
    const choice = payload?.choices?.[0]?.message;
    const elapsedMs = Date.now() - started;
    const completionTokens =
      Number(payload?.usage?.completion_tokens) || void 0;
    const reportedTokensPerSecond =
      Number(
        payload?.timings?.predicted_per_second ||
          payload?.timings?.tokens_per_second,
      ) || void 0;
    return {
      requestId: request.requestId,
      content: String(choice?.content || "").trim(),
      reasoningContent: choice?.reasoning_content,
      frameCount: prepared.files.length,
      promptTokens: Number(payload?.usage?.prompt_tokens) || void 0,
      completionTokens,
      tokensPerSecond:
        reportedTokensPerSecond ||
        (completionTokens
          ? completionTokens / Math.max(1e-3, elapsedMs / 1e3)
          : void 0),
      elapsedMs,
    };
  } catch (error) {
    if (controller.signal.aborted) throw new Error("反推任务已取消");
    throw error;
  } finally {
    activeRequests.delete(request.requestId);
    if (cleanup)
      try {
        node_fs.rmSync(cleanup, { recursive: true, force: true });
      } catch {}
  }
}
async function completeVisionText(prompt, settingsPatch, onLog) {
  if (!prompt.trim()) throw new Error("请输入需要处理的文字");
  const settings = saveVisionReverseSettings({
    ...getVisionReverseSettings(),
    ...(settingsPatch || {}),
  });
  await startVisionReverse(settings, onLog);
  const response = await fetch(`${getVisionHost()}/v1/chat/completions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: settings.modelPath
        ? node_path.basename(settings.modelPath)
        : "remote",
      messages: [{ role: "user", content: prompt }],
      max_tokens: settings.maxTokens,
      temperature: settings.temperature,
      top_p: settings.topP,
      top_k: settings.topK,
      min_p: settings.minP,
      repeat_penalty: settings.repeatPenalty,
      seed: settings.seed,
      stream: false,
      chat_template_kwargs: { enable_thinking: settings.reasoning },
      reasoning_budget: settings.reasoning ? settings.reasoningBudget : 0,
    }),
  });
  const payload = await response.json();
  if (!response.ok)
    throw new Error(
      payload?.error?.message ||
        payload?.message ||
        `llama.cpp 请求失败 (${response.status})`,
    );
  return String(payload?.choices?.[0]?.message?.content || "").trim();
}
function cancelVisionReverse(requestId) {
  const controller = activeRequests.get(requestId);
  if (!controller) return false;
  controller.abort();
  activeRequests.delete(requestId);
  return true;
}
function saveVisionCaption(request) {
  const imagePath = String(request?.mediaPath || request?.imagePath || "");
  if (
    !node_fs.existsSync(imagePath) ||
    !/\.(?:png|jpe?g|webp|bmp|gif|tiff?|avif|mp4|mov|mkv|webm|avi|m4v)$/i.test(
      imagePath,
    )
  )
    throw new Error("打标媒体不存在或格式不受支持");
  const caption = String(request?.caption || "")
    .replace(/\s+/g, " ")
    .trim();
  const triggerWord = String(request?.triggerWord || "")
    .replace(/[\r\n,]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (!caption) throw new Error("模型没有返回可写入的标签内容");
  if (!triggerWord) throw new Error("请输入统一触发词");
  const outputPath = node_path.join(
    node_path.dirname(imagePath),
    `${node_path.basename(imagePath, node_path.extname(imagePath))}.txt`,
  );
  if (node_fs.existsSync(outputPath) && !request.overwrite)
    return { outputPath, written: false };
  node_fs.writeFileSync(outputPath, `${triggerWord}, ${caption}`, "utf8");
  return { outputPath, written: true };
}
const visionReverse = /* @__PURE__ */ Object.freeze(
  /* @__PURE__ */ Object.defineProperty(
    {
      __proto__: null,
      cancelVisionReverse,
      completeVisionText,
      discoverVisionModels,
      getVisionReverseSettings,
      getVisionReverseStatus,
      loadVisionReverseTemplates,
      onVisionReverseLog,
      reverseMedia,
      saveVisionCaption,
      saveVisionReverseSettings,
      saveVisionReverseTemplates,
      startVisionReverse,
      stopVisionReverse,
    },
    Symbol.toStringTag,
    { value: "Module" },
  ),
);
const HF_BASE = "https://huggingface.co";
const MODELSCOPE_BASE = "https://modelscope.cn";
const MODELSCOPE_RECOMMENDED = [
  "unsloth/Qwen3-VL-4B-Instruct-GGUF",
  "unsloth/Qwen3-VL-8B-Instruct-GGUF",
  "unsloth/Qwen2.5-VL-3B-Instruct-GGUF",
  "unsloth/Qwen2.5-VL-7B-Instruct-GGUF",
  "lmstudio-community/Qwen2.5-VL-7B-Instruct-GGUF",
  "unsloth/gemma-3-4b-it-GGUF",
  "unsloth/gemma-3-12b-it-GGUF",
];
const activeDownloads = /* @__PURE__ */ new Map();
function validRepoId(repoId) {
  return /^[\w.-]+\/[\w.-]+$/.test(repoId);
}
function encodePath(value) {
  return value.split("/").map(encodeURIComponent).join("/");
}
function destinationDirectory(repoId) {
  const root = node_path.resolve(
    getWorkspaceSettings().modelsDir,
    "vision-reverse",
  );
  const target = node_path.resolve(root, repoId.replace("/", "--"));
  if (target !== root && !target.startsWith(`${root}${node_path.sep}`))
    throw new Error("模型保存目录无效");
  return target;
}
async function hfJson(path, signal) {
  const response = await fetch(`${HF_BASE}${path}`, {
    headers: { Accept: "application/json" },
    signal,
  });
  if (!response.ok)
    throw new Error(
      response.status === 429
        ? "Hugging Face 请求过于频繁，请稍后重试"
        : `Hugging Face 请求失败 (${response.status})`,
    );
  return response.json();
}
async function searchVisionHubRepositories(query, source = "modelscope") {
  const search = String(query || "").trim();
  if (source === "modelscope") {
    const terms = search
      .toLowerCase()
      .split(/\s+/)
      .filter((term) => !["gguf", "vision", "视觉", "模型"].includes(term));
    const direct = validRepoId(search) ? [search] : [];
    const candidates = [
      .../* @__PURE__ */ new Set([
        ...direct,
        ...MODELSCOPE_RECOMMENDED.filter((id) =>
          terms.every((term) => id.toLowerCase().includes(term)),
        ),
      ]),
    ];
    return candidates.map((id) => ({
      id,
      source,
      author: id.split("/")[0],
      downloads: 0,
      likes: 0,
      tags: ["GGUF", "vision"],
    }));
  }
  const rows = await hfJson(
    `/api/models?search=${encodeURIComponent(search || "vision GGUF")}&filter=gguf&sort=downloads&direction=-1&limit=30`,
  );
  return rows
    .map((row) => ({
      id: String(row.id || ""),
      source,
      author: String(row.author || String(row.id || "").split("/")[0] || ""),
      downloads: Number(row.downloads || 0),
      likes: Number(row.likes || 0),
      lastModified:
        typeof row.lastModified === "string" ? row.lastModified : void 0,
      tags: Array.isArray(row.tags) ? row.tags.map(String) : [],
    }))
    .filter((row) => validRepoId(row.id));
}
async function listVisionHubFiles(repoId, source = "modelscope") {
  if (!validRepoId(repoId)) throw new Error("模型仓库地址无效");
  if (source === "modelscope") {
    const response = await fetch(
      `${MODELSCOPE_BASE}/api/v1/models/${encodePath(repoId)}/repo/files?Revision=master&Root=`,
      { headers: { Accept: "application/json" } },
    );
    if (!response.ok)
      throw new Error(`魔搭文件列表读取失败 (${response.status})`);
    const payload = await response.json();
    const rows = payload.Data?.Files || payload.data?.files || [];
    return rows
      .map((file) => {
        const name = String(
          file.Path || file.Name || file.path || file.name || "",
        );
        const projector = /(?:mmproj|vision[-_ ]?projector)/i.test(
          node_path.basename(name),
        );
        return {
          name,
          size: Number(file.Size || file.size || 0),
          kind: projector ? "projector" : "model",
        };
      })
      .filter((file) => /\.gguf$/i.test(file.name))
      .sort(
        (a, b) =>
          a.kind.localeCompare(b.kind) ||
          a.name.localeCompare(b.name, "en", { numeric: true }),
      );
  }
  const detail = await hfJson(`/api/models/${encodePath(repoId)}?blobs=true`);
  return (detail.siblings || [])
    .map((file) => {
      const name = String(file.rfilename || "");
      const base2 = node_path.basename(name);
      const projector = /(?:mmproj|vision[-_ ]?projector)/i.test(base2);
      return {
        name,
        size: Number(file.size || file.lfs?.size || 0),
        kind: projector ? "projector" : "model",
      };
    })
    .filter((file) => /\.gguf$/i.test(file.name))
    .sort(
      (a, b) =>
        a.kind.localeCompare(b.kind) ||
        a.name.localeCompare(b.name, "en", { numeric: true }),
    );
}
function cancelVisionHubDownload(downloadId) {
  const controller = activeDownloads.get(downloadId);
  if (!controller) return false;
  controller.abort();
  return true;
}
async function downloadVisionHubModel(request, onProgress) {
  const downloadId = String(request?.downloadId || "");
  const repoId = String(request?.repoId || "");
  const source =
    request?.source === "huggingface" ? "huggingface" : "modelscope";
  const files = [...new Set((request?.files || []).map(String))];
  if (!downloadId || activeDownloads.has(downloadId))
    throw new Error("下载任务 ID 无效或已存在");
  if (
    !validRepoId(repoId) ||
    !files.length ||
    files.some(
      (file) =>
        !/\.gguf$/i.test(file) || file.includes("..") || /^[\\/]/.test(file),
    )
  )
    throw new Error("请选择有效的 GGUF 模型文件");
  const controller = new AbortController();
  activeDownloads.set(downloadId, controller);
  const directory = destinationDirectory(repoId);
  node_fs.mkdirSync(directory, { recursive: true });
  const paths = [];
  try {
    for (let index = 0; index < files.length; index += 1) {
      const fileName = files[index];
      const target = node_path.resolve(directory, node_path.basename(fileName));
      if (!target.startsWith(`${directory}${node_path.sep}`))
        throw new Error("模型文件名无效");
      const partial = `${target}.part-${downloadId}`;
      node_fs.rmSync(partial, { force: true });
      if (node_fs.existsSync(target)) {
        paths.push(target);
        onProgress({
          downloadId,
          repoId,
          fileName,
          fileIndex: index + 1,
          fileCount: files.length,
          receivedBytes: 0,
          totalBytes: 0,
          state: "completed",
          message: "文件已存在，已跳过",
        });
        continue;
      }
      const downloadUrl =
        source === "modelscope"
          ? `${MODELSCOPE_BASE}/models/${encodePath(repoId)}/resolve/master/${encodePath(fileName)}`
          : `${HF_BASE}/${encodePath(repoId)}/resolve/main/${encodePath(fileName)}?download=true`;
      const response = await fetch(downloadUrl, {
        redirect: "follow",
        signal: controller.signal,
      });
      if (!response.ok || !response.body)
        throw new Error(
          `下载 ${node_path.basename(fileName)} 失败 (${response.status})`,
        );
      const totalBytes = Number(
        response.headers.get("x-linked-size") ||
          response.headers.get("content-length") ||
          request.fileSizes?.[fileName] ||
          0,
      );
      let receivedBytes = 0;
      const responseStream = node_stream.Readable.fromWeb(response.body);
      responseStream.on("data", (chunk) => {
        receivedBytes += chunk.length;
        onProgress({
          downloadId,
          repoId,
          fileName,
          fileIndex: index + 1,
          fileCount: files.length,
          receivedBytes,
          totalBytes,
          state: "downloading",
        });
      });
      try {
        await promises$1.pipeline(
          responseStream,
          node_fs.createWriteStream(partial, { flags: "wx" }),
        );
      } catch (reason) {
        node_fs.rmSync(partial, { force: true });
        throw reason;
      }
      node_fs.renameSync(partial, target);
      paths.push(target);
      onProgress({
        downloadId,
        repoId,
        fileName,
        fileIndex: index + 1,
        fileCount: files.length,
        receivedBytes,
        totalBytes,
        state: "completed",
      });
    }
    return { downloadId, paths };
  } catch (reason) {
    const cancelled = controller.signal.aborted;
    onProgress({
      downloadId,
      repoId,
      fileName: files[paths.length] || "",
      fileIndex: paths.length + 1,
      fileCount: files.length,
      receivedBytes: 0,
      totalBytes: 0,
      state: cancelled ? "cancelled" : "error",
      message: cancelled
        ? "下载已取消"
        : reason instanceof Error
          ? reason.message
          : String(reason),
    });
    if (cancelled) throw new Error("下载已取消");
    throw reason;
  } finally {
    activeDownloads.delete(downloadId);
  }
}
function localUrl(path) {
  return encodeURI(`file:///${path.replace(/\\/g, "/")}`);
}
const nodeRequire = node_module.createRequire(
  require("url").pathToFileURL(__filename).href,
);
async function pickTextWorkbenchFiles() {
  const picked = await electron.dialog.showOpenDialog({
    title: "选择图片或 PDF",
    properties: ["openFile", "multiSelections"],
    filters: [
      {
        name: "图片与 PDF",
        extensions: ["png", "jpg", "jpeg", "webp", "bmp", "tif", "tiff", "pdf"],
      },
    ],
  });
  if (picked.canceled) return [];
  const output = [];
  for (const sourcePath of picked.filePaths) {
    if (node_path.extname(sourcePath).toLowerCase() !== ".pdf") {
      output.push({
        name: node_path.basename(sourcePath),
        path: sourcePath,
        url: localUrl(sourcePath),
        size: 0,
        sourcePath,
        sourceKind: "image",
      });
      continue;
    }
    const targetDir = node_path.join(
      electron.app.getPath("userData"),
      "text-workbench",
      `${Date.now()}-${crypto.randomUUID()}`,
    );
    node_fs.mkdirSync(targetDir, { recursive: true });
    const { pdf } = await import("pdf-to-img");
    const pdfJsRoot = node_path.dirname(
      nodeRequire.resolve("pdfjs-dist/package.json"),
    );
    const document = await pdf(sourcePath, {
      scale: 2,
      docInitParams: {
        standardFontDataUrl:
          node_path.join(pdfJsRoot, "standard_fonts") + node_path.sep,
      },
    });
    try {
      let pageNumber = 0;
      for await (const image of document) {
        pageNumber++;
        const path = node_path.join(
          targetDir,
          `page-${String(pageNumber).padStart(4, "0")}.png`,
        );
        node_fs.writeFileSync(path, image);
        output.push({
          name: `${node_path.basename(sourcePath)} · 第 ${pageNumber} 页`,
          path,
          url: localUrl(path),
          size: image.length,
          sourcePath,
          sourceKind: "pdf-page",
          pageNumber,
        });
      }
    } finally {
      await document.destroy();
    }
  }
  return output;
}
async function exportTextWorkbenchWord(request) {
  if (!request.pages.length) throw new Error("没有可以导出的识别结果");
  const save = await electron.dialog.showSaveDialog({
    title: "导出 Word",
    defaultPath: `${request.title.trim() || "文字识别结果"}.docx`,
    filters: [{ name: "Word 文档", extensions: ["docx"] }],
  });
  if (save.canceled || !save.filePath) return "";
  const children = [];
  request.pages.forEach((page, index) => {
    if (request.pages.length > 1)
      children.push(
        new docx.Paragraph({
          spacing: { before: index ? 280 : 0, after: 120 },
          children: [
            new docx.TextRun({ text: page.name, bold: true, size: 26 }),
          ],
        }),
      );
    const lines = page.text.replace(/\r\n/g, "\n").split("\n");
    lines.forEach((line) =>
      children.push(
        new docx.Paragraph({
          spacing: { line: 360, after: 80 },
          children: [
            new docx.TextRun({
              text: line || " ",
              size: 24,
              font: "Microsoft YaHei",
            }),
          ],
        }),
      ),
    );
  });
  const buffer = await docx.Packer.toBuffer(
    new docx.Document({ sections: [{ properties: {}, children }] }),
  );
  node_fs.writeFileSync(save.filePath, buffer);
  return save.filePath;
}
function chatSessionsDir() {
  const dir = node_path.join(electron.app.getPath("userData"), "chat-sessions");
  if (!node_fs.existsSync(dir)) node_fs.mkdirSync(dir, { recursive: true });
  return dir;
}
function loadChatSessions() {
  const sessions = [];
  for (const file of node_fs.readdirSync(chatSessionsDir())) {
    if (!file.endsWith(".json")) continue;
    try {
      sessions.push(
        JSON.parse(
          node_fs.readFileSync(node_path.join(chatSessionsDir(), file), "utf8"),
        ),
      );
    } catch {}
  }
  return sessions.sort((a, b) => b.updatedAt - a.updatedAt);
}
function saveChatSession(session) {
  node_fs.writeFileSync(
    node_path.join(chatSessionsDir(), `${session.id}.json`),
    JSON.stringify(session, null, 2),
    "utf8",
  );
  return session;
}
function deleteChatSession(id) {
  const filePath2 = node_path.join(chatSessionsDir(), `${id}.json`);
  if (node_fs.existsSync(filePath2)) node_fs.unlinkSync(filePath2);
}
const execFileAsync$1 = node_util.promisify(node_child_process.execFile);
function saveDesignSourceFile(request) {
  const configured = getWorkspaceSettings().outputDir;
  if (!configured) throw new Error("请先在存储设置中选择输出文件夹");
  const outputDir2 = node_path.join(configured, "设计源文件");
  node_fs.mkdirSync(outputDir2, { recursive: true });
  const safeProject = String(request.projectName || "YUH设计").replace(
    /[\\/:*?"<>|]+/g,
    "_",
  );
  const legacyDir = node_path.join(configured, "Canvas", "DesignSources");
  const safeId = String(request.projectId || "design").replace(
    /[^a-zA-Z0-9_-]+/g,
    "_",
  );
  const outputPath =
    request.existingPath &&
    node_path.extname(request.existingPath).toLowerCase() === ".svg"
      ? request.existingPath
      : node_fs.existsSync(
            node_path.join(legacyDir, `${safeProject}-${safeId}.svg`),
          )
        ? node_path.join(legacyDir, `${safeProject}-${safeId}.svg`)
        : node_path.join(
            outputDir2,
            `${safeProject}-${safeId.slice(0, 8)}.svg`,
          );
  node_fs.mkdirSync(node_path.dirname(outputPath), { recursive: true });
  node_fs.writeFileSync(outputPath, request.svg, "utf8");
  return { path: outputPath };
}
async function exportDesignAssetFile(request) {
  const configured = getWorkspaceSettings().outputDir;
  if (!configured) throw new Error("请先在存储设置中选择输出文件夹");
  const outputDir2 = node_path.join(configured, "Canvas", "DesignExports");
  node_fs.mkdirSync(outputDir2, { recursive: true });
  const safeProject = String(request.projectName || "YUH设计").replace(
    /[\\/:*?"<>|]+/g,
    "_",
  );
  const extension = request.format === "jpeg" ? "jpg" : request.format;
  const outputPath = node_path.join(
    outputDir2,
    `${safeProject}-${Date.now()}.${extension}`,
  );
  if (Array.isArray(request.data)) {
    const dpi = Math.max(
      36,
      Math.min(2400, Math.round(Number(request.dpi) || 96)),
    );
    let pipeline = sharp(Buffer.from(request.data), {
      failOn: "none",
    }).withMetadata({ density: dpi });
    if (request.colorMode === "cmyk")
      pipeline = pipeline.withIccProfile("cmyk");
    if (request.format === "jpeg")
      pipeline = pipeline.jpeg({ quality: 94, chromaSubsampling: "4:4:4" });
    else if (request.format === "webp")
      pipeline = pipeline.webp({ quality: 94 });
    else if (request.format === "tiff")
      pipeline = pipeline.tiff({ quality: 94, compression: "lzw" });
    else pipeline = pipeline.png({ compressionLevel: 8 });
    await pipeline.toFile(outputPath);
  } else node_fs.writeFileSync(outputPath, request.data, "utf8");
  return { path: outputPath };
}
function registerCanvasWorkflowIpc() {
  electron.ipcMain.handle("canvas:load-projects", () => loadCanvasProjects());
  electron.ipcMain.handle("canvas:save-projects", (_event, projects) =>
    saveCanvasProjects(projects),
  );
  electron.ipcMain.handle("canvas:load-drama-session", () =>
    loadDramaSession(),
  );
  electron.ipcMain.handle("canvas:load-drama-session-v2", () =>
    loadDramaSessionWithRevision(),
  );
  electron.ipcMain.handle("canvas:save-drama-session", (_event, session) =>
    saveDramaSession(session),
  );
  electron.ipcMain.handle("canvas:save-drama-session-cas", (_event, request) =>
    saveDramaSessionCas(request),
  );
  electron.ipcMain.handle("canvas:save-design-source", (_event, request) =>
    saveDesignSourceFile(request),
  );
  electron.ipcMain.handle("canvas:export-design-asset", (_event, request) =>
    exportDesignAssetFile(request),
  );
  electron.ipcMain.handle(
    "canvas:save-clipboard-image",
    async (_event, request) => {
      if (!node_fs.existsSync(request.outputDir))
        node_fs.mkdirSync(request.outputDir, { recursive: true });
      const outputPath = node_path.join(request.outputDir, request.name);
      node_fs.writeFileSync(outputPath, Buffer.from(request.buffer));
      return { outputPaths: [outputPath] };
    },
  );
  electron.ipcMain.handle("canvas:image-tool", (_event, request) =>
    runCanvasImageTool(request),
  );
  electron.ipcMain.handle(
    "canvas:export-workflow",
    async (_event, name, data) => {
      const safeName = String(name || "韵绘画布").replace(
        /[\\/:*?"<>|]+/g,
        "_",
      );
      const result2 = await electron.dialog.showSaveDialog({
        title: "导出韵绘画布工作流",
        defaultPath: `${safeName}.yunhui-workflow.json`,
        filters: [{ name: "韵绘工作流", extensions: ["json"] }],
      });
      if (result2.canceled || !result2.filePath) return { canceled: true };
      node_fs.writeFileSync(
        result2.filePath,
        JSON.stringify(data, null, 2),
        "utf8",
      );
      return { canceled: false, path: result2.filePath };
    },
  );
  electron.ipcMain.handle("canvas:import-workflow", async () => {
    const result2 = await electron.dialog.showOpenDialog({
      title: "导入韵绘画布工作流",
      properties: ["openFile"],
      filters: [{ name: "韵绘工作流", extensions: ["json"] }],
    });
    if (result2.canceled || !result2.filePaths[0]) return { canceled: true };
    const filePath2 = result2.filePaths[0];
    return {
      canceled: false,
      path: filePath2,
      data: JSON.parse(node_fs.readFileSync(filePath2, "utf8")),
    };
  });
  electron.ipcMain.handle(
    "canvas:export-workflow-zip",
    async (_event, name, data) => {
      const safeName = String(name || "韵绘画布").replace(
        /[\\/:*?"<>|]+/g,
        "_",
      );
      const result2 = await electron.dialog.showSaveDialog({
        title: "导出韵绘画布工作流（含资源）",
        defaultPath: `${safeName}.yunhui-workflow.zip`,
        filters: [{ name: "韵绘工作流 ZIP", extensions: ["zip"] }],
      });
      if (result2.canceled || !result2.filePath) return { canceled: true };
      const tempRoot = node_path.join(
        electron.app.getPath("temp"),
        `yunhui-workflow-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      );
      const assetsDir = node_path.join(tempRoot, "assets");
      node_fs.mkdirSync(assetsDir, { recursive: true });
      const pathMap = {};
      const project = data?.project;
      for (const node of project?.nodes || []) {
        const mediaItems = [
          node.media,
          ...(node.outputs || []),
          ...(node.references || []),
        ].filter(Boolean);
        for (const media of mediaItems) {
          const source = typeof media.path === "string" ? media.path : "";
          if (!source || pathMap[source] || !node_fs.existsSync(source))
            continue;
          node_path.extname(source) || ".bin";
          const targetName = `${Object.keys(pathMap).length + 1}-${node_path.basename(source).replace(/[\\/:*?"<>|]+/g, "_")}`;
          node_fs.copyFileSync(source, node_path.join(assetsDir, targetName));
          pathMap[source] = `assets/${targetName}`;
        }
      }
      node_fs.writeFileSync(
        node_path.join(tempRoot, "workflow.json"),
        JSON.stringify({ ...data, assetPathMap: pathMap }, null, 2),
        "utf8",
      );
      await execFileAsync$1(
        "powershell.exe",
        [
          "-NoProfile",
          "-NonInteractive",
          "-Command",
          "Compress-Archive -Path $env:YUNHUI_WORKFLOW_ROOT\\* -DestinationPath $env:YUNHUI_WORKFLOW_ZIP -Force",
        ],
        {
          windowsHide: true,
          timeout: 12e4,
          env: {
            ...process.env,
            YUNHUI_WORKFLOW_ROOT: tempRoot,
            YUNHUI_WORKFLOW_ZIP: result2.filePath,
          },
        },
      );
      return { canceled: false, path: result2.filePath };
    },
  );
  electron.ipcMain.handle("canvas:import-workflow-zip", async () => {
    const picked = await electron.dialog.showOpenDialog({
      title: "导入韵绘画布工作流（含资源）",
      properties: ["openFile"],
      filters: [{ name: "韵绘工作流 ZIP", extensions: ["zip"] }],
    });
    if (picked.canceled || !picked.filePaths[0]) return { canceled: true };
    const root = node_path.join(
      electron.app.getPath("temp"),
      `yunhui-workflow-import-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    );
    node_fs.mkdirSync(root, { recursive: true });
    await execFileAsync$1(
      "powershell.exe",
      [
        "-NoProfile",
        "-NonInteractive",
        "-Command",
        "Expand-Archive -LiteralPath $env:YUNHUI_WORKFLOW_ZIP -DestinationPath $env:YUNHUI_WORKFLOW_ROOT -Force",
      ],
      {
        windowsHide: true,
        timeout: 12e4,
        env: {
          ...process.env,
          YUNHUI_WORKFLOW_ZIP: picked.filePaths[0],
          YUNHUI_WORKFLOW_ROOT: root,
        },
      },
    );
    const data = JSON.parse(
      node_fs.readFileSync(node_path.join(root, "workflow.json"), "utf8"),
    );
    return {
      canceled: false,
      path: picked.filePaths[0],
      data,
      assetsRoot: root,
    };
  });
  electron.ipcMain.handle("canvas:import-skill", async () => {
    const picked = await electron.dialog.showOpenDialog({
      title: "导入 Agent Skill",
      properties: ["openFile"],
      filters: [{ name: "Skill 文件", extensions: ["md", "txt"] }],
    });
    if (picked.canceled || !picked.filePaths[0]) return { canceled: true };
    const path = picked.filePaths[0];
    const content = node_fs.readFileSync(path, "utf8");
    const firstHeading = content.match(/^#\s+(.+)$/m)?.[1]?.trim();
    return {
      canceled: false,
      path,
      name:
        firstHeading ||
        path
          .split(/[\\/]/)
          .at(-1)
          ?.replace(/\.(md|txt)$/i, "") ||
        "自定义技能",
      content,
    };
  });
}
let httpServer = null;
let wsServer = null;
let clients = /* @__PURE__ */ new Set();
let currentPort = 0;
let collaborativeProjects = [];
const projectRevisions = /* @__PURE__ */ new Map();
let collaborationReady = false;
function isCollaborativeProject(value) {
  if (!value || typeof value !== "object") return false;
  const project = value;
  return (
    typeof project.id === "string" &&
    project.id.length > 0 &&
    Array.isArray(project.nodes) &&
    Array.isArray(project.connections)
  );
}
function cloneProject(project) {
  return structuredClone(project);
}
function sameValue(left, right) {
  return JSON.stringify(left) === JSON.stringify(right);
}
function fileUrlToWebProxy(fileUrl) {
  try {
    return `/file?path=${encodeURIComponent(node_url.fileURLToPath(fileUrl))}`;
  } catch {
    return fileUrl;
  }
}
function restoreHostMediaUrls(value) {
  if (Array.isArray(value))
    return value.map((item) => restoreHostMediaUrls(item));
  if (!value || typeof value !== "object") return value;
  const source = value;
  const result2 = {};
  for (const [key, item] of Object.entries(source)) {
    if (
      key === "url" &&
      typeof item === "string" &&
      item.startsWith("/file?path=")
    ) {
      try {
        const filePath2 =
          new URL(item, "http://yuh.local").searchParams.get("path") || "";
        const normalized = filePath2.replace(/\\/g, "/");
        const encoded = normalized
          .split("/")
          .map((segment, index) =>
            index === 0 && /^[A-Za-z]:$/.test(segment)
              ? segment
              : encodeURIComponent(segment),
          )
          .join("/");
        result2[key] = `file:///${encoded}`;
      } catch {
        result2[key] = item;
      }
    } else {
      result2[key] = restoreHostMediaUrls(item);
    }
  }
  return result2;
}
function initializeCollaboration(force = false) {
  if (collaborationReady && !force) return;
  const stored = loadCanvasProjects();
  collaborativeProjects = Array.isArray(stored)
    ? stored
        .filter(isCollaborativeProject)
        .map((item) => restoreHostMediaUrls(cloneProject(item)))
    : [];
  projectRevisions.clear();
  for (const project of collaborativeProjects) {
    projectRevisions.set(project.id, {
      revision: 1,
      project: cloneProject(project),
      history: /* @__PURE__ */ new Map([[1, cloneProject(project)]]),
    });
  }
  collaborationReady = true;
}
function rememberRevision(entry) {
  entry.history.set(entry.revision, cloneProject(entry.project));
  while (entry.history.size > 50)
    entry.history.delete(entry.history.keys().next().value);
}
function mergeById(current, base2, incoming) {
  const result2 = new Map(current.map((item) => [item.id, item]));
  const baseMap = new Map(base2.map((item) => [item.id, item]));
  const incomingMap = new Map(incoming.map((item) => [item.id, item]));
  const touched = /* @__PURE__ */ new Set([
    ...baseMap.keys(),
    ...incomingMap.keys(),
  ]);
  for (const id of touched) {
    const before = baseMap.get(id);
    const next = incomingMap.get(id);
    if (!before && next) result2.set(id, next);
    else if (before && !next) result2.delete(id);
    else if (before && next && !sameValue(before, next)) result2.set(id, next);
  }
  return [...result2.values()];
}
function mergeConcurrentProject(current, base2, incoming) {
  const merged = {
    ...current,
    nodes: mergeById(current.nodes, base2.nodes, incoming.nodes),
    connections: mergeById(
      current.connections,
      base2.connections,
      incoming.connections,
    ),
    // 每个人的缩放/平移不互相抢夺；画布内容才参与团队同步。
    viewport:
      incoming.shareMode === "presentation"
        ? incoming.viewport
        : current.viewport,
    updatedAt: /* @__PURE__ */ new Date().toISOString(),
  };
  for (const key of ["name", "favorites"]) {
    if (!sameValue(base2[key], incoming[key])) merged[key] = incoming[key];
  }
  return merged;
}
function applyCollaborativeProject(project, baseRevision) {
  initializeCollaboration(true);
  const incoming = restoreHostMediaUrls(cloneProject(project));
  const existing = projectRevisions.get(incoming.id);
  if (
    existing &&
    incoming.updatedAt &&
    existing.project.updatedAt &&
    incoming.updatedAt < existing.project.updatedAt
  ) {
    return existing;
  }
  let nextProject = incoming;
  if (
    existing &&
    typeof baseRevision === "number" &&
    baseRevision < existing.revision
  ) {
    const base2 = existing.history.get(baseRevision);
    if (base2)
      nextProject = mergeConcurrentProject(existing.project, base2, incoming);
  }
  const entry = {
    revision: (existing?.revision || 0) + 1,
    project: cloneProject(nextProject),
    history: existing?.history || /* @__PURE__ */ new Map(),
  };
  rememberRevision(entry);
  projectRevisions.set(nextProject.id, entry);
  const index = collaborativeProjects.findIndex(
    (item) => item.id === nextProject.id,
  );
  if (index >= 0) collaborativeProjects[index] = nextProject;
  else collaborativeProjects.push(nextProject);
  void persistCollaborativeProjects().catch((error) =>
    console.error("[sharing] 团队画布保存失败", error),
  );
  return entry;
}
async function persistCollaborativeProjects() {
  if (!collaborativeProjects.length) return null;
  return await saveCanvasProjects(collaborativeProjects);
}
function snapshotPayload() {
  const shared = collaborativeProjects.filter(
    (item) => item.shareMode === "team" || item.shareMode === "presentation",
  );
  return {
    projects: shared.map(cloneProject),
    revisions: Object.fromEntries(
      shared.map((item) => [
        item.id,
        projectRevisions.get(item.id)?.revision || 0,
      ]),
    ),
  };
}
const blockedChannels = /* @__PURE__ */ new Set([
  "files:pick",
  "utilities:pick-images",
  "utilities:pick-files",
  "utilities:pick-video",
  "utilities:pick-directory",
  "utilities:pick-images-from-directory",
  "utilities:pick-videos-from-directory",
  "workspace:pick-directory",
  // 团队端的画布修改必须走带版本号的 canvas-update；禁止直接整包覆盖主机磁盘或修改共享权限。
  "canvas:save-projects",
  "canvas:export-workflow",
  "canvas:import-workflow",
  "canvas:import-skill",
  "shell:open-path",
  "shell:show-item",
  "shell:save-item",
  "window:set-theme",
]);
const channelHandlers = {};
let handlersRegistered = false;
function registerSharingHandlers() {
  if (handlersRegistered) return;
  handlersRegistered = true;
  const send2 = (channel, payload) => {
    broadcastEvent(channel, payload);
    const win = electron.BrowserWindow.getAllWindows()[0];
    if (win && !win.isDestroyed()) win.webContents.send(channel, payload);
  };
  Object.assign(channelHandlers, {
    // backend
    "backend:status": () => getBackendStatus(),
    "backend:start": async () => {
      const status = await startBackend((line) => send2("backend:log", line));
      if (status.state === "ready")
        await recoverPersistedTasks((task) => send2("tasks:update", task));
      return status;
    },
    "backend:restart": async () => {
      const status = await restartBackend((line) => send2("backend:log", line));
      if (status.state === "ready")
        await recoverPersistedTasks((task) => send2("tasks:update", task));
      return status;
    },
    "backend:unload-gpu": async () => {
      const { unloadAllGpuMemory: unloadAllGpuMemory2 } =
        await Promise.resolve().then(() => backend);
      await unloadAllGpuMemory2();
      return { ok: true };
    },
    "vision-reverse:status": () => getVisionReverseStatus(),
    "vision-reverse:save-settings": (input) => saveVisionReverseSettings(input),
    "vision-reverse:load-templates": () => loadVisionReverseTemplates(),
    "vision-reverse:save-templates": (input) =>
      saveVisionReverseTemplates(input),
    "vision-reverse:start": (input) =>
      startVisionReverse(input, (line) => send2("vision-reverse:log", line)),
    "vision-reverse:stop": () => stopVisionReverse(),
    "vision-reverse:run": (request) =>
      reverseMedia(request, (line) => send2("vision-reverse:log", line)),
    "vision-reverse:save-caption": (request) => saveVisionCaption(request),
    "vision-reverse:cancel": (requestId) => cancelVisionReverse(requestId),
    "vision-reverse:search-models": (query, source) =>
      searchVisionHubRepositories(query, source),
    "vision-reverse:list-model-files": (repoId, source) =>
      listVisionHubFiles(repoId, source),
    "vision-reverse:download-model": (request) =>
      downloadVisionHubModel(request, (progress) =>
        send2("vision-reverse:download-progress", progress),
      ),
    "vision-reverse:cancel-download": (downloadId) =>
      cancelVisionHubDownload(downloadId),
    "text-workbench:pick-files": () => pickTextWorkbenchFiles(),
    "text-workbench:export-word": (request) => exportTextWorkbenchWord(request),
    "text-workbench:local-proofread": (prompt) =>
      completeVisionText(prompt, {
        providerId: "local-qwen38",
        temperature: 0.1,
        reasoning: false,
      }),
    // workspace
    "workspace:get": () => getWorkspaceSettings(),
    "workspace:save": (input) => {
      const settings = saveWorkspaceSettings(input);
      void serpentHost.ensureComfyuiOutputLink(settings.outputDir);
      return settings;
    },
    // tasks
    "tasks:create": (req) =>
      createGeneration(req, (task) => send2("tasks:update", task)),
    "tasks:create-image": (req) =>
      createImageGeneration(req, (task) => send2("tasks:update", task)),
    "tasks:list": async () => {
      await recoverPersistedTasks((task) => send2("tasks:update", task));
      return listTasks();
    },
    "tasks:interrupt": () =>
      interruptGeneration((task) => send2("tasks:update", task)),
    "tasks:cancel": (taskId) =>
      cancelSingleTask(taskId, (task) => send2("tasks:update", task)),
    "tasks:prepare-mode": (mode) =>
      prepareLocalMode(mode, (task) => send2("tasks:update", task)),
    // providers
    "providers:list": () => listProviders(),
    "providers:save": (input) => saveProvider(input),
    "providers:remove": (id) => removeProvider(id),
    "providers:models": (id) => discoverModels(id),
    // cloud
    "cloud-images:generate": (req) => generateCloudImage(req),
    "cloud-videos:generate": (req) => generateCloudVideo(req),
    "cloud-audios:generate": (req) => generateCloudAudio(req),
    // Whisper 语音转文字：远程端同样调用主机中转站完成
    "cloud-audios:transcribe": (req) => transcribeWhisper(req),
    // chat：与桌面端共用 chatSessions.ts 单一实现，避免两份目录读写逻辑漂移
    "chat:send": (req) => sendChat(req),
    "chat:save-path": () => chatSessionsDir(),
    "chat:load-sessions": () => loadChatSessions(),
    "chat:save-session": (session) => saveChatSession(session),
    "chat:delete-session": (id) => deleteChatSession(id),
    // utilities (非文件选择)
    "utilities:convert": (req) => convertImages(req),
    "utilities:rename": (req) => batchRenameFiles(req),
    "utilities:similarity-rename": (req) => renameBySimilarity(req),
    "utilities:txt-batch": (req) => processTxtPairs(req),
    "utilities:split": (req) => splitImages(req),
    "utilities:slice": (req) => sliceImage(req),
    // 多图一次复制：CF_HTML 嵌 data URL，CDR/Word 粘贴一次导入全部切片
    "files:copy-images": async (req) => {
      const paths = Array.isArray(req) ? req : [];
      if (!paths.length) return false;
      const images = [];
      for (const item of paths) {
        let realPath = String(item || "");
        if (realPath.startsWith("/file?path="))
          realPath = decodeURIComponent(realPath.slice("/file?path=".length));
        if (!realPath || !node_fs.existsSync(realPath)) continue;
        try {
          images.push(
            `data:image/${node_path.extname(realPath).toLowerCase() === ".png" ? "png" : "jpeg"};base64,${node_fs.readFileSync(realPath).toString("base64")}`,
          );
        } catch {}
      }
      if (!images.length) return false;
      return images;
    },
    "utilities:stitch": (req) => stitchImages(req),
    "utilities:mosaic": (req) => mosaicImages(req),
    "utilities:manual-mosaic": (req) => manualMosaicImage(req),
    "utilities:motion": (req) => applyVideoMotion(req),
    "utilities:canvas-crop": (req) => cropCanvasImage(req),
    "utilities:canvas-annotation": (req) => saveCanvasAnnotation(req),
    "utilities:canvas-thumbnail": async (req) =>
      fileUrlToWebProxy(await createCanvasThumbnail(req)),
    "utilities:upscale": (req) => upscaleMedia(req),
    "utilities:extract-audio": (req) => extractVideoAudio(req),
    "utilities:trim-audio": (req) => trimAudio(req),
    "utilities:motion-presets": () => {
      const presetsPath = electron.app.isPackaged
        ? node_path.join(process.resourcesPath, "video_motion_presets.json")
        : node_path.join(
            electron.app.getAppPath(),
            "resources",
            "video_motion_presets.json",
          );
      try {
        return node_fs.existsSync(presetsPath)
          ? JSON.parse(node_fs.readFileSync(presetsPath, "utf8"))
          : {};
      } catch {
        return {};
      }
    },
    // 画布本地算力工具：远程端经主机执行（ffmpeg / OpenCV / sharp）
    "utilities:merge-videos": (req) => mergeVideos(req),
    "utilities:extract-frame": (req) => extractVideoFrame(req),
    "utilities:vectorize": (req) => vectorizeImage(req),
    // 内置 Qwen3-TTS / IndexTTS 语音引擎：模型与 GPU 都在主机上，远程端直接调用
    "tts:status": () => getTtsStatus(),
    "tts:start": () => startTts((line) => send2("tts:log", line)),
    "tts:stop": () => stopTts(),
    "tts:unload": () => unloadTtsModels(),
    "tts:voice_design": (req) => ttsVoiceDesign(req),
    "indextts:status": () => getIndexTtsStatus(),
    "indextts:start": () =>
      startIndexTts((line) => send2("indextts:log", line)),
    "indextts:stop": () => stopIndexTts(),
    "indextts:unload": () => unloadIndexTts(),
    "indextts:clone": (req) => indexTtsClone(req),
    // 单图复制：Web 端无法写主机系统剪贴板，返回 data URL 由浏览器自行写剪贴板
    "files:copy-image": (path) => {
      let realPath = String(path || "");
      if (realPath.startsWith("/file?path="))
        realPath = decodeURIComponent(realPath.slice("/file?path=".length));
      if (!realPath || !node_fs.existsSync(realPath)) return "";
      try {
        return `data:image/${node_path.extname(realPath).toLowerCase() === ".png" ? "png" : "jpeg"};base64,${node_fs.readFileSync(realPath).toString("base64")}`;
      } catch {
        return "";
      }
    },
    // file:// 加载失败兜底：把主机本地文件读成 data URL（与桌面端 files:read-as-data-url 行为一致）
    "files:read-as-data-url": (path) => {
      let realPath = String(path || "");
      if (realPath.startsWith("file://"))
        realPath = node_url.fileURLToPath(realPath);
      if (realPath.startsWith("/file?path="))
        realPath = decodeURIComponent(realPath.slice("/file?path=".length));
      if (!realPath || !node_fs.existsSync(realPath)) return "";
      const buf = node_fs.readFileSync(realPath);
      const ext = node_path.extname(realPath).toLowerCase();
      const mime =
        ext === ".png"
          ? "image/png"
          : ext === ".jpg" || ext === ".jpeg"
            ? "image/jpeg"
            : ext === ".webp"
              ? "image/webp"
              : ext === ".gif"
                ? "image/gif"
                : ext === ".bmp"
                  ? "image/bmp"
                  : ext === ".svg"
                    ? "image/svg+xml"
                    : ext === ".mp3" || ext === ".wav" || ext === ".m4a"
                      ? "audio/mpeg"
                      : ext === ".mp4" || ext === ".webm"
                        ? "video/mp4"
                        : "application/octet-stream";
      return `data:${mime};base64,${buf.toString("base64")}`;
    },
    // 远程端文件操作：把主机路径还原成 Reference（Web 拖放上传流程）与回收站删除
    "files:resolve": (paths) => paths.map(asReference),
    // 节点缩略图（与桌面端 filesIpc files:thumbnail 一致）：返回 data URL，失败返回 null
    "files:thumbnail": async (path, width) => {
      let realPath = String(path || "");
      if (realPath.startsWith("/file?path="))
        realPath = decodeURIComponent(realPath.slice("/file?path=".length));
      if (!realPath) return null;
      try {
        return await createCanvasThumbnail({
          file: realPath,
          width: Number(width) || 320,
        });
      } catch {
        return null;
      }
    },
    // 音频库扫描（剪辑器左侧面板）：子文件夹名即分类（BGM/SFX）
    "files:list-audio-library": (rootDir) => scanAudioLibrary(rootDir),
    // 切片宫格"下载全部"：复制到主机桌面新文件夹并打开定位
    "files:download-to-desktop": (files, folderName) =>
      downloadFilesToDesktop(files, folderName),
    "files:trash": async (paths) => {
      if (!Array.isArray(paths) || !paths.length)
        return { success: true, failed: [] };
      const failed = [];
      for (const item of paths) {
        try {
          if (item && node_fs.existsSync(item))
            await electron.shell.trashItem(item);
        } catch (err) {
          console.warn("[files:trash] failed:", item, err);
          failed.push(String(item));
        }
      }
      return { success: failed.length === 0, failed };
    },
    // system
    "system:usage": () => getSystemUsage(),
    // canvas
    "canvas:load-projects": () => {
      initializeCollaboration(true);
      return collaborativeProjects
        .filter(
          (item) =>
            item.shareMode === "team" || item.shareMode === "presentation",
        )
        .map(cloneProject);
    },
    "canvas:save-projects": (projects) => {
      initializeCollaboration(true);
      if (!Array.isArray(projects)) throw new Error("画布项目格式无效");
      const incoming = projects
        .filter(isCollaborativeProject)
        .map((project) => restoreHostMediaUrls(cloneProject(project)))
        .filter((project) => !isProjectTombstoned(project.id));
      if (!incoming.length) throw new Error("画布项目格式无效");
      for (const project of incoming) {
        const existingIndex = collaborativeProjects.findIndex(
          (item) => item.id === project.id,
        );
        if (existingIndex >= 0) collaborativeProjects[existingIndex] = project;
        else collaborativeProjects.push(project);
        const previous = projectRevisions.get(project.id);
        const revision = (previous?.revision || 0) + 1;
        const entry = {
          revision,
          project: cloneProject(project),
          history: previous?.history || /* @__PURE__ */ new Map(),
        };
        rememberRevision(entry);
        projectRevisions.set(project.id, entry);
      }
      return persistCollaborativeProjects();
    },
    "canvas:load-drama-session": () => loadDramaSession(),
    "canvas:load-drama-session-v2": () => loadDramaSessionWithRevision(),
    "canvas:save-drama-session": (session) => saveDramaSession(session),
    "canvas:save-drama-session-cas": (request) => saveDramaSessionCas(request),
    "canvas:image-tool": (req) => runCanvasImageTool(req),
    // 设计模式 SVG 源保存 / 成品导出：与桌面端 canvasWorkflowIpc 共用同一落盘实现，
    // 否则 Web 端进设计模式后保存与导出会报“未知通道”
    "canvas:save-design-source": (req) => saveDesignSourceFile(req),
    "canvas:export-design-asset": (req) => exportDesignAssetFile(req),
    "canvas:save-clipboard-image": (req) => {
      if (!node_fs.existsSync(req.outputDir))
        node_fs.mkdirSync(req.outputDir, { recursive: true });
      const outputPath = node_path.join(req.outputDir, req.name);
      node_fs.writeFileSync(outputPath, Buffer.from(req.buffer));
      return { outputPaths: [outputPath] };
    },
    // 存储管理（设置面板）：与桌面端 storageIpc 共用实现，Web 壳下打开
    // 软件设置时扫描/清理/备份恢复同样可用
    "storage:scan-outputs": () => scanOutputStorage(),
    "storage:trash-outputs": (selection) => trashOutputGroups(selection),
    "storage:list-canvas-projects": () => listCanvasProjectSummaries(),
    "storage:list-canvas-backups": () => listCanvasBackups(),
    "storage:restore-canvas-backup": (fileName) =>
      restoreCanvasBackup(fileName),
    // vectorizer.ai 设置（iOS/Web 设置界面加载时需要）
    "vectorizer-ai:get-settings": () => getVectorizerAiSettings(),
    "vectorizer-ai:save-settings": (input) => saveVectorizerAiSettings(input),
    "vectorizer-ai:test-connection": () => testVectorizerAiConnection(),
    "vectorizer-ai:get-credit": () => getVectorizerAiCredit(),
    "vectorizer-ai:recharge": (req) => rechargeVectorizerAi(req),
    "vectorizer-ai:cancel": (requestId) => cancelVectorizerAiRequest(requestId),
    // 图转矢量节点实际执行通道（此前只开放了设置类通道，节点运行会报“未知通道”）
    "vectorizer-ai:vectorize": (req) => vectorizeWithVectorizerAi(req),
    // 视频剪辑器元数据与缩略图（iOS 剪辑入口）
    "editor:video-meta": (path) => getVideoMeta(path),
    "editor:thumbnails": (req) => generateThumbnails(req),
    // 剪辑合成导出：ffmpeg 在主机执行，进度同时推给远程端
    "editor:render": (req) =>
      renderComposition(req, (progress) =>
        send2("editor:render-progress", progress),
      ),
  });
}
function readStream(stream) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    stream.on("data", (chunk) => chunks.push(chunk));
    stream.on("end", () => resolve(Buffer.concat(chunks)));
    stream.on("error", reject);
  });
}
function broadcastEvent(channel, payload) {
  if (clients.size === 0) return;
  const msg = JSON.stringify({ type: "event", channel, payload });
  for (const client of clients) {
    if (client.readyState === ws.WebSocket.OPEN) client.send(msg);
  }
}
function broadcastCanvasUpdate(project) {
  if (!isCollaborativeProject(project)) return;
  const entry = applyCollaborativeProject(project);
  if (
    entry.project.shareMode === "team" ||
    entry.project.shareMode === "presentation"
  ) {
    broadcastEvent("canvas:project", {
      project: entry.project,
      revision: entry.revision,
      sourceClientId: "desktop",
    });
  } else {
    broadcastEvent("canvas:unshared", { projectId: entry.project.id });
  }
}
function applyRemoteCanvasUpdate(project, baseRevision) {
  if (!isCollaborativeProject(project)) throw new Error("画布项目格式无效");
  const entry = applyCollaborativeProject(project, baseRevision);
  return { project: cloneProject(entry.project), revision: entry.revision };
}
async function handleHttpRequest(req, res) {
  const url = new URL(req.url || "/", `http://localhost:${currentPort}`);
  if (url.pathname.startsWith("/comfyui/")) {
    const comfyPath = url.pathname.slice("/comfyui".length);
    const targetUrl = `http://127.0.0.1:8190${comfyPath}${url.search}`;
    try {
      const headers = {};
      const skipHeaders = /* @__PURE__ */ new Set([
        "host",
        "connection",
        "content-length",
      ]);
      for (const [k, v] of Object.entries(req.headers)) {
        if (!skipHeaders.has(k.toLowerCase()) && typeof v === "string")
          headers[k] = v;
      }
      const body =
        req.method === "GET" || req.method === "HEAD"
          ? void 0
          : await readStream(req);
      const upstream = await fetch(targetUrl, {
        method: req.method || "GET",
        headers,
        body,
      });
      res.writeHead(upstream.status, {
        "Content-Type":
          upstream.headers.get("content-type") || "application/json",
        "Access-Control-Allow-Origin": "*",
      });
      const buf = Buffer.from(await upstream.arrayBuffer());
      res.end(buf);
    } catch (err) {
      res.writeHead(502, {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      });
      res.end(JSON.stringify({ error: "引擎未启动", detail: String(err) }));
    }
    return;
  }
  if (url.pathname === "/vision/start" && req.method === "POST") {
    try {
      const status = await startVisionReverse(void 0, (line) =>
        broadcastEvent("vision-reverse:log", line),
      );
      res.writeHead(200, {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      });
      res.end(
        JSON.stringify({
          ok: true,
          state: status.state,
          message: status.message,
        }),
      );
    } catch (err) {
      res.writeHead(500, {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      });
      res.end(
        JSON.stringify({
          ok: false,
          error: err instanceof Error ? err.message : String(err),
        }),
      );
    }
    return;
  }
  if (url.pathname === "/file") {
    const filePath22 = url.searchParams.get("path");
    if (!filePath22 || !node_fs.existsSync(filePath22)) {
      res.writeHead(404);
      res.end("Not found");
      return;
    }
    try {
      const ext = node_path.extname(filePath22).toLowerCase();
      const mimeTypes = {
        ".png": "image/png",
        ".jpg": "image/jpeg",
        ".jpeg": "image/jpeg",
        ".webp": "image/webp",
        ".bmp": "image/bmp",
        ".gif": "image/gif",
        ".mp4": "video/mp4",
        ".webm": "video/webm",
        ".mov": "video/quicktime",
        ".wav": "audio/wav",
        ".mp3": "audio/mpeg",
        ".flac": "audio/flac",
        ".m4a": "audio/mp4",
        ".aac": "audio/aac",
        ".ogg": "audio/ogg",
        ".json": "application/json",
      };
      const stats = node_fs.statSync(filePath22);
      const contentType = mimeTypes[ext] || "application/octet-stream";
      const commonHeaders = {
        "Content-Type": contentType,
        "Cache-Control": "no-cache",
        "Access-Control-Allow-Origin": "*",
        "Accept-Ranges": "bytes",
      };
      const range = req.headers.range;
      if (range) {
        const match = /^bytes=(\d*)-(\d*)$/.exec(range);
        if (!match) {
          res.writeHead(416, { "Content-Range": `bytes */${stats.size}` });
          res.end();
          return;
        }
        const start = match[1] ? Number(match[1]) : 0;
        const end = match[2]
          ? Math.min(Number(match[2]), stats.size - 1)
          : stats.size - 1;
        if (
          !Number.isFinite(start) ||
          !Number.isFinite(end) ||
          start > end ||
          start >= stats.size
        ) {
          res.writeHead(416, { "Content-Range": `bytes */${stats.size}` });
          res.end();
          return;
        }
        res.writeHead(206, {
          ...commonHeaders,
          "Content-Range": `bytes ${start}-${end}/${stats.size}`,
          "Content-Length": end - start + 1,
        });
        if (req.method === "HEAD") res.end();
        else node_fs.createReadStream(filePath22, { start, end }).pipe(res);
        return;
      }
      res.writeHead(200, { ...commonHeaders, "Content-Length": stats.size });
      if (req.method === "HEAD") res.end();
      else node_fs.createReadStream(filePath22).pipe(res);
    } catch {
      res.writeHead(500);
      res.end("Read error");
    }
    return;
  }
  if (url.pathname === "/app-icon") {
    const light = url.searchParams.get("theme") === "light";
    const iconName = light ? "yuh-studio-light.ico" : "yuh-studio-dark.ico";
    const iconPath = electron.app.isPackaged
      ? node_path.join(process.resourcesPath, iconName)
      : node_path.join(electron.app.getAppPath(), "build", iconName);
    if (!node_fs.existsSync(iconPath)) {
      res.writeHead(404);
      res.end("Icon not found");
      return;
    }
    const data = node_fs.readFileSync(iconPath);
    res.writeHead(200, {
      "Content-Type": "image/x-icon",
      "Content-Length": data.length,
      "Cache-Control": "public, max-age=3600",
    });
    res.end(data);
    return;
  }
  const rendererDir = electron.app.isPackaged
    ? node_path.join(__dirname, "../renderer")
    : node_path.join(electron.app.getAppPath(), "out", "renderer");
  let filePath2;
  if (url.pathname === "/" || url.pathname === "") {
    filePath2 = node_path.join(rendererDir, "index.html");
  } else {
    filePath2 = node_path.join(rendererDir, node_path.normalize(url.pathname));
  }
  const safeRendererDir = rendererDir.endsWith(node_path.sep)
    ? rendererDir
    : rendererDir + node_path.sep;
  if (!filePath2.startsWith(safeRendererDir)) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }
  if (!node_fs.existsSync(filePath2) || !node_fs.statSync(filePath2).isFile()) {
    filePath2 = node_path.join(rendererDir, "index.html");
    if (!node_fs.existsSync(filePath2)) {
      res.writeHead(404);
      res.end("Renderer not built. Run npm run build first.");
      return;
    }
  }
  try {
    const data = node_fs.readFileSync(filePath2);
    const ext = node_path.extname(filePath2).toLowerCase();
    const mimeTypes = {
      ".html": "text/html; charset=utf-8",
      ".js": "application/javascript; charset=utf-8",
      ".css": "text/css; charset=utf-8",
      ".json": "application/json",
      ".svg": "image/svg+xml",
      ".png": "image/png",
      ".jpg": "image/jpeg",
      ".ico": "image/x-icon",
      ".woff": "font/woff",
      ".woff2": "font/woff2",
      ".ttf": "font/ttf",
    };
    if (ext === ".html") {
      let html = data.toString("utf8");
      const injectScript = `<script>window.__YUNHUI_WEB_MODE__ = true; window.__YUNHUI_WS_PORT__ = ${currentPort};<\/script>`;
      html = html.replace("<head>", `<head>${injectScript}`);
      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
      res.end(html);
      return;
    }
    res.writeHead(200, {
      "Content-Type": mimeTypes[ext] || "application/octet-stream",
    });
    res.end(data);
  } catch {
    res.writeHead(500);
    res.end("Internal error");
  }
}
async function handleWsMessage(ws2, data) {
  let msg;
  try {
    msg = JSON.parse(data);
  } catch {
    return;
  }
  if (msg.type === "api") {
    const { id, channel, args } = msg;
    if (blockedChannels.has(channel)) {
      ws2.send(
        JSON.stringify({ type: "response", id, error: "此功能仅限桌面端使用" }),
      );
      return;
    }
    const handler = channelHandlers[channel];
    if (!handler) {
      ws2.send(
        JSON.stringify({ type: "response", id, error: `未知通道: ${channel}` }),
      );
      return;
    }
    try {
      const result2 = await handler(...(args || []));
      ws2.send(JSON.stringify({ type: "response", id, result: result2 }));
    } catch (err) {
      ws2.send(
        JSON.stringify({
          type: "response",
          id,
          error: err instanceof Error ? err.message : String(err),
        }),
      );
    }
    return;
  }
  if (msg.type === "canvas-delete") {
    const projectId = msg.projectId;
    if (typeof projectId !== "string" || !projectId) return;
    initializeCollaboration(true);
    const existed = collaborativeProjects.some((item) => item.id === projectId);
    if (!existed) return;
    collaborativeProjects = collaborativeProjects.filter(
      (item) => item.id !== projectId,
    );
    projectRevisions.delete(projectId);
    void persistCollaborativeProjects().catch((error) =>
      console.error("[sharing] 团队画布保存失败", error),
    );
    broadcastEvent("canvas:unshared", { projectId });
    const win = electron.BrowserWindow.getAllWindows()[0];
    if (win && !win.isDestroyed())
      win.webContents.send("canvas:remote-update", {
        unsharedProjectId: projectId,
      });
    return;
  }
  if (msg.type === "canvas-update") {
    if (!isCollaborativeProject(msg.project)) return;
    initializeCollaboration(true);
    if (isProjectTombstoned(msg.project.id)) return;
    const current = projectRevisions.get(msg.project.id)?.project;
    if (current && current.shareMode !== "team") return;
    msg.project.shareMode = "team";
    const applied = applyRemoteCanvasUpdate(msg.project, msg.baseRevision);
    if (
      applied.project.shareMode !== "team" &&
      applied.project.shareMode !== "presentation"
    )
      return;
    const payload = {
      project: applied.project,
      revision: applied.revision,
      sourceClientId: msg.clientId,
    };
    broadcastEvent("canvas:project", payload);
    const win = electron.BrowserWindow.getAllWindows()[0];
    if (win && !win.isDestroyed()) {
      win.webContents.send("canvas:remote-update", {
        ...payload,
        acknowledged: payload.sourceClientId === "desktop",
      });
    }
  }
}
function getLocalIPs() {
  const ips = [];
  try {
    const os = require("node:os");
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
      for (const iface of interfaces[name] || []) {
        if (iface.family === "IPv4" && !iface.internal) {
          ips.push(iface.address);
        }
      }
    }
  } catch {}
  return ips;
}
async function startSharing(port) {
  if (httpServer && currentPort > 0) {
    const ips2 = getLocalIPs();
    return {
      port: currentPort,
      urls: ips2.map((ip) => `http://${ip}:${currentPort}`),
    };
  }
  registerSharingHandlers();
  initializeCollaboration(true);
  for (let attempt = 0; attempt < 10; attempt++) {
    const tryPort = port + attempt;
    currentPort = tryPort;
    httpServer = node_http.createServer(handleHttpRequest);
    const success = await new Promise((resolve) => {
      httpServer.once("error", () => {
        httpServer.close();
        resolve(false);
      });
      httpServer.listen(tryPort, "0.0.0.0", () => resolve(true));
    });
    if (success) break;
    httpServer = null;
    if (attempt === 9)
      throw new Error(`无法启动共享服务，端口 ${port}-${port + 9} 均被占用`);
  }
  wsServer = new ws.WebSocketServer({ server: httpServer, path: "/ws" });
  wsServer.on("connection", (ws2) => {
    clients.add(ws2);
    ws2.on("message", (data) => void handleWsMessage(ws2, data.toString()));
    ws2.on("close", () => clients.delete(ws2));
    ws2.on("error", () => clients.delete(ws2));
    ws2.send(
      JSON.stringify({ type: "connected", message: "已连接到韵绘共享服务" }),
    );
    ws2.send(JSON.stringify({ type: "canvas-snapshot", ...snapshotPayload() }));
  });
  const ips = getLocalIPs();
  const urls = ips.map((ip) => `http://${ip}:${currentPort}`);
  return { port: currentPort, urls };
}
function stopSharing() {
  if (wsServer) {
    for (const client of clients) {
      try {
        client.close();
      } catch {}
    }
    clients.clear();
    wsServer.close();
    wsServer = null;
  }
  if (httpServer) {
    httpServer.close();
    httpServer = null;
  }
  currentPort = 0;
  collaborativeProjects = [];
  projectRevisions.clear();
  collaborationReady = false;
}
function getSharingStatus() {
  return {
    active: httpServer !== null,
    port: currentPort,
    urls: httpServer
      ? getLocalIPs().map((ip) => `http://${ip}:${currentPort}`)
      : [],
    clients: clients.size,
  };
}
function settingsFile() {
  return node_path.join(electron.app.getPath("userData"), "auto-start.json");
}
function readAutoStartSettings() {
  try {
    const file = settingsFile();
    return node_fs.existsSync(file)
      ? JSON.parse(node_fs.readFileSync(file, "utf-8"))
      : { autoStart: false, autoShare: false };
  } catch {
    return { autoStart: false, autoShare: false };
  }
}
function writeAutoStartSettings(data) {
  try {
    node_fs.writeFileSync(settingsFile(), JSON.stringify(data));
  } catch {}
}
function registerAutoStartIpc() {
  electron.ipcMain.handle("autostart:get", async () => {
    const settings = readAutoStartSettings();
    if (settings.autoShare && !getSharingStatus().active) {
      try {
        await startSharing(18080);
      } catch {}
    }
    return settings;
  });
  electron.ipcMain.handle("autostart:set", (_event, data) => {
    writeAutoStartSettings(data);
    electron.app.setLoginItemSettings({
      openAtLogin: data.autoStart,
      args: ["--hidden"],
    });
    return true;
  });
}
const execFileAsync = node_util.promisify(node_child_process.execFile);
const LAST_PICK_FILE = () =>
  node_path.join(electron.app.getPath("userData"), "last-pick-dir.txt");
function getLastPickDir() {
  try {
    const dir = node_fs.readFileSync(LAST_PICK_FILE(), "utf8").trim();
    return dir && node_fs.existsSync(dir) ? dir : void 0;
  } catch {
    return void 0;
  }
}
function saveLastPickDir(filePath2) {
  try {
    const dir = node_path.dirname(filePath2);
    if (dir) node_fs.writeFileSync(LAST_PICK_FILE(), dir);
  } catch {}
}
async function copyFileToClipboard(path) {
  try {
    await execFileAsync(
      "powershell.exe",
      [
        "-NoProfile",
        "-NonInteractive",
        "-Command",
        "Set-Clipboard -LiteralPath $env:YUNHUI_CLIPBOARD_IMAGE",
      ],
      {
        windowsHide: true,
        timeout: 5e3,
        env: { ...process.env, YUNHUI_CLIPBOARD_IMAGE: path },
      },
    );
    console.log("[copy-image] Success via CF_HDROP file clipboard:", path);
    return true;
  } catch (error) {
    console.warn("[copy-image] CF_HDROP file clipboard failed:", error);
    return false;
  }
}
function readClipboardFiles() {
  try {
    const output = node_child_process.execFileSync(
      "powershell.exe",
      [
        "-NoProfile",
        "-NonInteractive",
        "-Command",
        "$items = @(Get-Clipboard -Format FileDropList); foreach ($item in $items) { [Convert]::ToBase64String([Text.Encoding]::UTF8.GetBytes([string]$item)) }",
      ],
      { encoding: "ascii", timeout: 3e3, windowsHide: true },
    );
    return output
      .split(/\r?\n/)
      .map((encoded) => encoded.trim())
      .filter(Boolean)
      .map((encoded) => Buffer.from(encoded, "base64").toString("utf8"))
      .filter(Boolean);
  } catch {
    return [];
  }
}
function registerFileIpc() {
  electron.ipcMain.handle("files:pick", async (_event, kind) => {
    const filters =
      kind === "image"
        ? [{ name: "图片", extensions: ["png", "jpg", "jpeg", "webp", "bmp"] }]
        : kind === "video"
          ? [{ name: "视频", extensions: ["mp4", "mov", "mkv", "webm", "avi"] }]
          : [
              {
                name: "音频",
                extensions: ["wav", "mp3", "flac", "m4a", "aac", "ogg"],
              },
            ];
    const result2 = await electron.dialog.showOpenDialog({
      defaultPath: getLastPickDir(),
      properties: ["openFile", "multiSelections"],
      filters,
    });
    if (result2.canceled || !result2.filePaths.length) return [];
    saveLastPickDir(result2.filePaths[0]);
    return result2.filePaths.map(asReference);
  });
  electron.ipcMain.handle("files:resolve", (_event, paths) =>
    paths.map(asReference),
  );
  electron.ipcMain.handle("files:list-audio-library", (_event, rootDir) =>
    scanAudioLibrary(rootDir),
  );
  electron.ipcMain.handle(
    "files:download-to-desktop",
    (_event, files, folderName) => downloadFilesToDesktop(files, folderName),
  );
  electron.ipcMain.handle(
    "files:thumbnail",
    async (_event, filePath2, width) => {
      try {
        return await createCanvasThumbnail({ file: filePath2, width });
      } catch {
        return null;
      }
    },
  );
  electron.ipcMain.handle(
    "files:read-as-data-url",
    async (_event, filePath2) => {
      try {
        let realPath = filePath2;
        if (realPath.startsWith("file://"))
          realPath = node_url.fileURLToPath(realPath);
        if (!node_fs.existsSync(realPath)) return "";
        const buf = node_fs.readFileSync(realPath);
        const ext = node_path.extname(realPath).toLowerCase();
        const mime =
          ext === ".png"
            ? "image/png"
            : ext === ".jpg" || ext === ".jpeg"
              ? "image/jpeg"
              : ext === ".webp"
                ? "image/webp"
                : ext === ".gif"
                  ? "image/gif"
                  : ext === ".bmp"
                    ? "image/bmp"
                    : ext === ".svg"
                      ? "image/svg+xml"
                      : ext === ".mp3" || ext === ".wav" || ext === ".m4a"
                        ? "audio/mpeg"
                        : ext === ".mp4" || ext === ".webm"
                          ? "video/mp4"
                          : "application/octet-stream";
        return `data:${mime};base64,${buf.toString("base64")}`;
      } catch {
        return "";
      }
    },
  );
  electron.ipcMain.handle(
    "files:copy-to-directory",
    async (_event, paths, outputDir2) => {
      if (!Array.isArray(paths) || !paths.length) return { outputPaths: [] };
      if (!outputDir2?.trim()) throw new Error("目标文件夹为空");
      node_fs.mkdirSync(outputDir2, { recursive: true });
      const outputPaths = [];
      const stamp = Date.now();
      for (let index = 0; index < paths.length; index += 1) {
        let sourcePath = String(paths[index] || "");
        if (sourcePath.startsWith("file://"))
          sourcePath = node_url.fileURLToPath(sourcePath);
        if (
          !sourcePath ||
          !node_fs.existsSync(sourcePath) ||
          !node_fs.statSync(sourcePath).isFile()
        ) {
          throw new Error(`源图片不存在或无法读取：${sourcePath || "空路径"}`);
        }
        const originalName = node_path.basename(sourcePath);
        const extension = node_path.extname(originalName);
        const stem =
          originalName.slice(0, originalName.length - extension.length) ||
          "clipboard";
        const safeStem =
          stem.replace(/[<>:"/\\|?*\u0000-\u001f]/g, "_").slice(0, 120) ||
          "clipboard";
        const safeExtension = extension
          .replace(/[^.a-zA-Z0-9]/g, "")
          .slice(0, 12);
        const outputPath = node_path.join(
          outputDir2,
          `${stamp}-${index}-${safeStem}${safeExtension}`,
        );
        node_fs.copyFileSync(sourcePath, outputPath);
        outputPaths.push(outputPath);
      }
      return { outputPaths };
    },
  );
  electron.ipcMain.handle("files:trash", async (_event, paths) => {
    if (!Array.isArray(paths) || !paths.length)
      return { success: true, failed: [] };
    const failed = [];
    for (const item of paths) {
      let realPath = String(item || "");
      if (!realPath) continue;
      if (realPath.startsWith("file://"))
        realPath = node_url.fileURLToPath(realPath);
      try {
        if (!node_fs.existsSync(realPath)) continue;
        await electron.shell.trashItem(realPath);
      } catch (err) {
        console.warn("[files:trash] failed:", realPath, err);
        failed.push(realPath);
      }
    }
    return { success: failed.length === 0, failed };
  });
  electron.ipcMain.handle("files:copy-image", async (_event, filePath2) => {
    try {
      let realPath = filePath2;
      if (realPath.startsWith("file://"))
        realPath = node_url.fileURLToPath(realPath);
      if (!node_fs.existsSync(realPath)) {
        console.error("[copy-image] File not found:", realPath);
        return false;
      }
      const buf = node_fs.readFileSync(realPath);
      const isPng =
        buf.length > 8 && buf[1] === 80 && buf[2] === 78 && buf[3] === 71;
      const isSvg = node_path.extname(realPath).toLowerCase() === ".svg";
      if ((isPng || isSvg) && (await copyFileToClipboard(realPath)))
        return true;
      if (!isSvg) {
        try {
          const pngBuffer = await sharp(buf).png().toBuffer();
          const tempPath = node_path.join(
            electron.app.getPath("temp"),
            `yunhui-clip-${Date.now()}.png`,
          );
          node_fs.writeFileSync(tempPath, pngBuffer);
          if (await copyFileToClipboard(tempPath)) return true;
          try {
            node_fs.unlinkSync(tempPath);
          } catch {}
        } catch (error) {
          console.warn("[copy-image] temp PNG conversion failed:", error);
        }
      }
      const img = electron.nativeImage.createFromBuffer(buf);
      if (img && !img.isEmpty()) {
        electron.clipboard.writeImage(img);
        console.log(
          "[copy-image] Success via nativeImage DIB, size:",
          img.getSize(),
        );
        return true;
      }
      console.error(
        "[copy-image] All methods failed, buffer length:",
        buf.length,
      );
      return false;
    } catch (err) {
      console.error("[copy-image] Failed:", err);
      return false;
    }
  });
  electron.ipcMain.handle("files:copy-images", async (_event, filePaths) => {
    if (!Array.isArray(filePaths) || !filePaths.length) return false;
    try {
      const parts = [];
      let firstPng = "";
      for (const item of filePaths) {
        let realPath = String(item || "");
        if (realPath.startsWith("file://"))
          realPath = node_url.fileURLToPath(realPath);
        if (!node_fs.existsSync(realPath)) continue;
        const buffer = node_fs.readFileSync(realPath);
        const extension = node_path.extname(realPath).toLowerCase();
        let dataUrl;
        if (extension === ".png") {
          dataUrl = `data:image/png;base64,${buffer.toString("base64")}`;
        } else {
          const pngBuffer = await sharp(buffer).png().toBuffer();
          dataUrl = `data:image/png;base64,${pngBuffer.toString("base64")}`;
        }
        if (!firstPng && extension === ".png") firstPng = realPath;
        parts.push(
          `<img src="${dataUrl}" alt="${node_path.basename(realPath)}" />`,
        );
      }
      if (!parts.length) return false;
      const html = `<!DOCTYPE html><html><body style="margin:0">${parts.join("\n")}</body></html>`;
      electron.clipboard.write({
        html,
        text: filePaths.map((item) => node_path.basename(item)).join("\n"),
        // 同时写一张位图，兼容只认位图剪贴板的软件（取第一张 PNG）
        image: (() => {
          let target = firstPng;
          if (!target) {
            for (const item of filePaths) {
              const candidate = String(item || "");
              if (/\.(png|jpe?g|webp|bmp)$/i.test(candidate)) {
                target = candidate;
                break;
              }
            }
          }
          if (!target) return void 0;
          try {
            const img = electron.nativeImage.createFromBuffer(
              node_fs.readFileSync(target),
            );
            return img && !img.isEmpty() ? img : void 0;
          } catch {
            return void 0;
          }
        })(),
      });
      return true;
    } catch (err) {
      console.error("[copy-images] Failed:", err);
      return false;
    }
  });
  electron.ipcMain.handle("files:read-clipboard-image", async () => {
    try {
      const img = electron.clipboard.readImage();
      if (!img.isEmpty()) {
        const buf = img.toPNG();
        const size = img.getSize();
        return {
          data: Array.from(buf),
          width: size.width,
          height: size.height,
        };
      }
      return null;
    } catch {
      return null;
    }
  });
  electron.ipcMain.handle("files:read-clipboard-all", async () => {
    try {
      const filePaths = readClipboardFiles();
      if (filePaths.length) return { kind: "files", paths: filePaths };
      const img = electron.clipboard.readImage();
      if (!img.isEmpty()) {
        return {
          kind: "bitmap",
          data: Array.from(img.toPNG()),
          width: img.getSize().width,
          height: img.getSize().height,
        };
      }
      return null;
    } catch {
      return null;
    }
  });
  electron.ipcMain.handle("files:read-clipboard-files", async () => {
    return readClipboardFiles();
  });
}
let mainWindow = null;
function setMainWindow(window) {
  mainWindow = window;
}
function getMainWindow() {
  return mainWindow;
}
function send(channel, payload) {
  if (mainWindow && !mainWindow.isDestroyed())
    mainWindow.webContents.send(channel, payload);
  try {
    broadcastEvent(channel, payload);
  } catch {}
}
function sendToMainWindow(channel, payload) {
  if (mainWindow && !mainWindow.isDestroyed())
    mainWindow.webContents.send(channel, payload);
}
function registerRecognitionIpc() {
  electron.ipcMain.handle("vision-reverse:status", () =>
    getVisionReverseStatus(),
  );
  electron.ipcMain.handle("vision-reverse:save-settings", (_event, input) =>
    saveVisionReverseSettings(input),
  );
  electron.ipcMain.handle("vision-reverse:load-templates", () =>
    loadVisionReverseTemplates(),
  );
  electron.ipcMain.handle("vision-reverse:save-templates", (_event, input) =>
    saveVisionReverseTemplates(input),
  );
  electron.ipcMain.handle("vision-reverse:start", (_event, input) =>
    startVisionReverse(input, (line) => send("vision-reverse:log", line)),
  );
  electron.ipcMain.handle("vision-reverse:stop", () => stopVisionReverse());
  electron.ipcMain.handle("vision-reverse:run", (_event, request) =>
    reverseMedia(request, (line) => send("vision-reverse:log", line)),
  );
  electron.ipcMain.handle("vision-reverse:save-caption", (_event, request) =>
    saveVisionCaption(request),
  );
  electron.ipcMain.handle("vision-reverse:cancel", (_event, requestId) =>
    cancelVisionReverse(requestId),
  );
  electron.ipcMain.handle(
    "vision-reverse:search-models",
    (_event, query, source) => searchVisionHubRepositories(query, source),
  );
  electron.ipcMain.handle(
    "vision-reverse:list-model-files",
    (_event, repoId, source) => listVisionHubFiles(repoId, source),
  );
  electron.ipcMain.handle("vision-reverse:download-model", (_event, request) =>
    downloadVisionHubModel(request, (progress) =>
      send("vision-reverse:download-progress", progress),
    ),
  );
  electron.ipcMain.handle(
    "vision-reverse:cancel-download",
    (_event, downloadId) => cancelVisionHubDownload(downloadId),
  );
  electron.ipcMain.handle("text-workbench:pick-files", () =>
    pickTextWorkbenchFiles(),
  );
  electron.ipcMain.handle("text-workbench:export-word", (_event, request) =>
    exportTextWorkbenchWord(request),
  );
  electron.ipcMain.handle("text-workbench:local-proofread", (_event, prompt) =>
    completeVisionText(prompt, {
      providerId: "local-qwen38",
      temperature: 0.1,
      reasoning: false,
    }),
  );
}
function registerSpeechIpc() {
  electron.ipcMain.handle("tts:status", () => getTtsStatus());
  electron.ipcMain.handle("tts:start", () =>
    startTts((line) => send("tts:log", line)),
  );
  electron.ipcMain.handle("tts:stop", () => stopTts());
  electron.ipcMain.handle("tts:unload", async () => unloadTtsModels());
  electron.ipcMain.handle("tts:voice_design", (_event, request) =>
    ttsVoiceDesign(request),
  );
  electron.ipcMain.handle("indextts:status", () => getIndexTtsStatus());
  electron.ipcMain.handle("indextts:start", () =>
    startIndexTts((line) => send("indextts:log", line)),
  );
  electron.ipcMain.handle("indextts:stop", () => stopIndexTts());
  electron.ipcMain.handle("indextts:unload", () => unloadIndexTts());
  electron.ipcMain.handle("indextts:clone", (_event, request) =>
    indexTtsClone(request),
  );
}
function registerAiProviderIpc() {
  electron.ipcMain.handle("providers:list", () => listProviders());
  electron.ipcMain.handle("providers:save", (_event, input) =>
    saveProvider(input),
  );
  electron.ipcMain.handle("providers:remove", (_event, id) =>
    removeProvider(id),
  );
  electron.ipcMain.handle("providers:models", (_event, id) =>
    discoverModels(id),
  );
  electron.ipcMain.handle("cloud-images:generate", (_event, request) =>
    generateCloudImage(request).then((result) => {
      recordCloudGeneration(
        result,
        "image",
        request?.taskType ||
          (request?.references && request.references.length ? "img2img" : "txt2img"),
      );
      return result;
    }),
  );
  electron.ipcMain.handle("cloud-videos:generate", (event, request) => {
    const cancel = new AbortController();
    const onSenderGone = () => cancel.abort();
    event.sender.once("destroyed", onSenderGone);
    return generateCloudVideo(request, cancel.signal)
      .then((result) => {
        recordCloudGeneration(
          result,
          "video",
          request?.taskType ||
            (request?.references && request.references.length ? "img2video" : "text"),
        );
        return result;
      })
      .finally(() => {
        event.sender.removeListener("destroyed", onSenderGone);
      });
  });
  electron.ipcMain.handle("cloud-audios:generate", (_event, request) =>
    generateCloudAudio(request).then((result) => {
      recordCloudGeneration(result, "audio", request?.taskType || "voice");
      return result;
    }),
  );
  electron.ipcMain.handle("cloud-audios:transcribe", (_event, request) =>
    transcribeWhisper(request),
  );
  electron.ipcMain.handle("chat:send", (_event, request) => sendChat(request));
  electron.ipcMain.handle("chat:save-path", () => chatSessionsDir());
  electron.ipcMain.handle("chat:load-sessions", () => loadChatSessions());
  electron.ipcMain.handle("chat:save-session", (_event, session) =>
    saveChatSession(session),
  );
  electron.ipcMain.handle("chat:delete-session", (_event, id) =>
    deleteChatSession(id),
  );
}
function registerUtilitiesIpc() {
  electron.ipcMain.handle("utilities:pick-images", (_event, multiple) =>
    pickUtilityImages(multiple),
  );
  electron.ipcMain.handle("utilities:pick-files", () => pickUtilityFiles());
  electron.ipcMain.handle("utilities:pick-video", () => pickUtilityVideo());
  electron.ipcMain.handle("utilities:pick-directory", (_event, currentPath) =>
    pickUtilityDirectory(currentPath),
  );
  electron.ipcMain.handle(
    "utilities:pick-images-from-directory",
    (_event, currentPath) => pickImagesFromDirectory(currentPath),
  );
  electron.ipcMain.handle(
    "utilities:pick-videos-from-directory",
    (_event, currentPath) => pickVideosFromDirectory(currentPath),
  );
  electron.ipcMain.handle("utilities:convert", (_event, request) =>
    convertImages(request),
  );
  electron.ipcMain.handle("utilities:rename", (_event, request) =>
    batchRenameFiles(request),
  );
  electron.ipcMain.handle("utilities:similarity-rename", (_event, request) =>
    renameBySimilarity(request),
  );
  electron.ipcMain.handle("utilities:txt-batch", (_event, request) =>
    processTxtPairs(request),
  );
  electron.ipcMain.handle("utilities:split", (_event, request) =>
    splitImages(request),
  );
  electron.ipcMain.handle("utilities:stitch", (_event, request) =>
    stitchImages(request),
  );
  electron.ipcMain.handle("utilities:mosaic", (_event, request) =>
    mosaicImages(request),
  );
  electron.ipcMain.handle("utilities:manual-mosaic", (_event, request) =>
    manualMosaicImage(request),
  );
  electron.ipcMain.handle("utilities:motion", (_event, request) =>
    applyVideoMotion(request),
  );
  electron.ipcMain.handle("utilities:canvas-crop", (_event, request) =>
    cropCanvasImage(request),
  );
  electron.ipcMain.handle("utilities:slice", (_event, request) =>
    sliceImage(request),
  );
  electron.ipcMain.handle("utilities:canvas-annotation", (_event, request) =>
    saveCanvasAnnotation(request),
  );
  electron.ipcMain.handle("utilities:canvas-thumbnail", (_event, request) =>
    createCanvasThumbnail(request),
  );
  electron.ipcMain.handle("utilities:upscale", (_event, request) =>
    upscaleMedia(request),
  );
  electron.ipcMain.handle("utilities:extract-audio", (_event, request) =>
    extractVideoAudio(request),
  );
  electron.ipcMain.handle("utilities:trim-audio", (_event, request) =>
    trimAudio(request),
  );
  electron.ipcMain.handle("utilities:merge-videos", (_event, request) =>
    mergeVideos(request),
  );
  electron.ipcMain.handle("utilities:extract-frame", (_event, request) =>
    extractVideoFrame(request),
  );
  electron.ipcMain.handle("utilities:vectorize", (_event, request) =>
    vectorizeImage(request),
  );
  electron.ipcMain.handle("vectorizer-ai:get-settings", () =>
    getVectorizerAiSettings(),
  );
  electron.ipcMain.handle("vectorizer-ai:save-settings", (_event, request) =>
    saveVectorizerAiSettings(request),
  );
  electron.ipcMain.handle("vectorizer-ai:test-connection", () =>
    testVectorizerAiConnection(),
  );
  electron.ipcMain.handle("vectorizer-ai:get-credit", () =>
    getVectorizerAiCredit(),
  );
  electron.ipcMain.handle("vectorizer-ai:recharge", (_event, request) =>
    rechargeVectorizerAi(request),
  );
  electron.ipcMain.handle("vectorizer-ai:cancel", (_event, requestId) =>
    cancelVectorizerAiRequest(requestId),
  );
  electron.ipcMain.handle("vectorizer-ai:vectorize", (_event, request) =>
    vectorizeWithVectorizerAi(request),
  );
  electron.ipcMain.handle("editor:video-meta", (_event, path) =>
    getVideoMeta(path),
  );
  electron.ipcMain.handle("editor:thumbnails", (_event, request) =>
    generateThumbnails(request),
  );
  electron.ipcMain.handle("editor:render", async (_event, request) => {
    try {
      const result2 = await renderComposition(request, (progress) => {
        sendToMainWindow("editor:render-progress", progress);
      });
      return result2;
    } catch (err) {
      console.error("[editor:render] failed:", err);
      return {
        outputPath: "",
        success: false,
        error: err instanceof Error ? err.message : String(err),
      };
    }
  });
  electron.ipcMain.handle("utilities:motion-presets", () => {
    const presetsPath = electron.app.isPackaged
      ? node_path.join(process.resourcesPath, "video_motion_presets.json")
      : node_path.join(
          electron.app.getAppPath(),
          "resources",
          "video_motion_presets.json",
        );
    try {
      if (node_fs.existsSync(presetsPath))
        return JSON.parse(node_fs.readFileSync(presetsPath, "utf8"));
      return {};
    } catch {
      return {};
    }
  });
}
function registerBackendIpc() {
  electron.ipcMain.handle("backend:status", () => getBackendStatus());
  electron.ipcMain.handle("backend:start", async () => {
    const status = await startBackend((line) => send("backend:log", line));
    if (status.state === "ready")
      await recoverPersistedTasks((task) => send("tasks:update", task));
    return status;
  });
  electron.ipcMain.handle("backend:restart", async () => {
    const status = await restartBackend((line) => send("backend:log", line));
    if (status.state === "ready")
      await recoverPersistedTasks((task) => send("tasks:update", task));
    return status;
  });
  electron.ipcMain.handle("backend:unload-gpu", () => unloadAllGpuMemory());
  electron.ipcMain.handle("tasks:create", (_event, request) =>
    createGeneration(request, (task) => send("tasks:update", task)),
  );
  electron.ipcMain.handle("tasks:create-image", (_event, request) =>
    createImageGeneration(request, (task) => send("tasks:update", task)),
  );
  electron.ipcMain.handle("tasks:list", async () => {
    await recoverPersistedTasks((task) => send("tasks:update", task));
    return listTasks();
  });
  electron.ipcMain.handle("tasks:interrupt", () =>
    interruptGeneration((task) => send("tasks:update", task)),
  );
  electron.ipcMain.handle("tasks:cancel", (_event, taskId) =>
    cancelSingleTask(taskId, (task) => send("tasks:update", task)),
  );
  electron.ipcMain.handle("tasks:remove", (_event, taskId) => {
    const task = tasks.get(taskId);
    if (
      task &&
      (task.status === "queued" || task.status === "running")
    ) {
      throw new Error("任务运行中，请先停止再删除");
    }
    tasks.delete(taskId);
    persistTasks();
    return true;
  });
  electron.ipcMain.handle("tasks:prepare-mode", (_event, mode) =>
    prepareLocalMode(mode, (task) => send("tasks:update", task)),
  );
}
function listCustomWorkflows() {
  return workflows.listWorkflows(getWorkspaceSettings().comfyuiDir || "");
}

function inspectCustomWorkflowFile(filePath) {
  const info = workflows.inspectWorkflow(filePath);
  return {
    path: filePath,
    format: info.format,
    nodeCount: info.nodeCount,
    skippedNodes: info.skippedNodes,
    warnings: info.warnings,
    nodeTypes: info.nodeTypes,
    slots: info.slots,
    slotValues: info.slotValues,
    modelSlots: info.modelSlots,
    fileSlots: info.fileSlots,
    outputNodes: info.outputNodes,
    textSlots: info.textSlots || [],
    isAudioGraph: Boolean(info.isAudioGraph),
  };
}

async function validateCustomWorkflowFile(filePath) {
  const info = workflows.inspectWorkflow(filePath);
  if (!info.nodeCount) {
    return {
      path: filePath,
      backendReachable: true,
      nodeIssues: [
        { classType: "", message: "工作流中没有可用节点（可能全部被禁用/旁路）" },
      ],
      modelSlots: [],
    };
  }
  const graph = workflows.pruneUnreachable(info.api);
  const validation = await workflows.validateAgainstBackend(
    getBackendHost(),
    graph,
    info.modelSlots,
  );
  return {
    path: filePath,
    backendReachable: validation.backendReachable,
    nodeIssues: validation.nodeIssues,
    modelSlots: (validation.modelIssues || []).map((item) => ({
      nodeId: item.nodeId,
      input: item.input,
      nodeTitle: item.nodeTitle,
      value: item.value,
      found: item.found,
      folder: item.folder,
      candidates: item.candidates || [],
    })),
  };
}

async function runCustomWorkflowTask(request, onUpdate) {
  ensureTasksLoaded();
  await ensureEngineReady();
  if (!request?.path) throw new Error("未选择工作流文件");
  const busy = [...tasks.values()].some(
    (task) =>
      task.kind === "custom-workflow" &&
      (task.status === "queued" || task.status === "running"),
  );
  if (busy) throw new Error("已有自定义工作流任务在运行，请等待完成");
  const info = workflows.inspectWorkflow(request.path);
  if (!info.nodeCount)
    throw new Error("工作流中没有可用节点（可能全部被禁用）");
  let graph = workflows.pruneUnreachable(info.api);
  const seed = request.randomizeSeed
    ? Math.floor(Math.random() * Number.MAX_SAFE_INTEGER)
    : request.seed;
  graph = workflows.applyOverrides(graph, info.slots, {
    prompt: typeof request.prompt === "string" ? request.prompt : void 0,
    width: request.width,
    height: request.height,
    length: request.length,
    duration: typeof request.duration === "number" ? request.duration : void 0,
    steps: request.steps,
    cfg: request.cfg,
    fps: request.fps,
    seed,
    modelFiles: request.modelFiles || {},
    textOverrides: request.textOverrides || {},
  });
  // 模型文件槽位按文件名重映射为当前引擎候选名，避免提交时 value_not_in_list
  graph = await workflows.remapModelValues(graph, info.modelSlots, getBackendHost());
  // 补齐转换时丢失的必填组件（如 easy 节点的 download_from），避免提交 400
  graph = await workflows.completeRequiredInputs(graph, info.raw, getBackendHost());
  const localId = node_crypto.randomUUID();
  const references = (request.files || []).map((item) => ({
    path: item.path,
    name: node_path.basename(item.path),
    kind: item.kind || kindFor(item.path),
  }));
  const uploaded = [];
  for (const reference of references) {
    const uploadedName = await uploadReference(reference, `h3-custom/${localId}`);
    uploaded.push({ kind: reference.kind, name: uploadedName });
  }
  graph = workflows.assignUploadedFiles(graph, info.fileSlots, uploaded);
  const now = /* @__PURE__ */ new Date().toISOString();
  const task = {
    id: localId,
    kind: "custom-workflow",
    workflowName: node_path.basename(request.path),
    workflowPath: request.path,
    prompt: String(request.prompt || info.slotValues.prompt || ""),
    status: "queued",
    progress: 4,
    createdAt: now,
    updatedAt: now,
    width: request.width,
    height: request.height,
    duration: request.duration,
    seed,
    taskType:
      typeof request.taskType === "string" && request.taskType.trim()
        ? request.taskType
        : inferTaskTypeFromWorkflowPath(request.path),
  };
  tasks.set(localId, task);
  persistTasks();
  onUpdate(task);
  try {
    const queued = await requestJson("/prompt", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: graph, client_id: localId }),
    });
    if (!queued.prompt_id)
      throw new Error(
        `任务提交失败：${JSON.stringify(queued.error || "未知错误")}`,
      );
    const running = updateTask(localId, {
      backendPromptId: queued.prompt_id,
      status: "running",
      progress: 12,
      error: void 0,
    });
    await flushTaskPersistence();
    onUpdate(running);
    void pollCustomWorkflowTask(localId, queued.prompt_id, onUpdate);
    return running;
  } catch (error) {
    const cancelled = tasks.get(localId);
    if (cancelled?.status === "cancelled") return cancelled;
    const failed = updateTask(localId, {
      status: "failed",
      progress: 0,
      error: error instanceof Error ? error.message : "工作流提交失败",
    });
    onUpdate(failed);
    throw error;
  }
}

async function pollCustomWorkflowTask(taskId, promptId, onUpdate) {
  let progress = 12;
  let failures = 0;
  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  try {
    for (;;) {
      const current = tasks.get(taskId);
      if (!current || current.status === "cancelled") return;
      if (current.status !== "queued" && current.status !== "running") return;
      let record;
      try {
        const history = await requestJson(`/history/${promptId}`);
        record = history[promptId];
        failures = 0;
      } catch (error) {
        failures += 1;
        if (failures < 4) {
          await sleep(2500);
          continue;
        }
        if (isEngineProcessAlive()) {
          failures = 0;
          onUpdate(
            updateTask(taskId, {
              status: "running",
              progress,
              backendPromptId: promptId,
              error: "引擎计算繁忙，等待真实队列响应…",
            }),
          );
          await sleep(5000);
          continue;
        }
        throw new Error("引擎连接中断，任务已停止");
      }
      if (record) {
        const statusText = record.status?.status_str;
        if (statusText === "error") {
          const messages = record.status?.messages || [];
          const executionError = messages.find(
            (item) => item?.[0] === "execution_error",
          );
          throw new Error(
            executionError?.[1]?.exception_message || "工作流执行失败",
          );
        }
        if (record.status?.completed) {
          onUpdate(
            updateTask(taskId, {
              status: "running",
              progress: 97,
              backendPromptId: promptId,
              error: void 0,
            }),
          );
          await finalizeFromHistory(taskId, record, onUpdate);
          return;
        }
      }
      const queueState = await promptQueueState(promptId).catch(
        () => "unreachable",
      );
      if (queueState === "unreachable" || queueState === "missing") {
        failures += 1;
        if (queueState === "missing" && failures >= 3) {
          if (isEngineProcessAlive()) continue;
          throw new Error("任务不在执行队列中，引擎连接已中断");
        }
        if (queueState === "unreachable" && failures >= 4) {
          if (isEngineProcessAlive()) {
            failures = 0;
            onUpdate(
              updateTask(taskId, {
                status: "running",
                progress,
                backendPromptId: promptId,
                error: "引擎计算繁忙，等待真实队列响应…",
              }),
            );
            await sleep(5000);
            continue;
          }
          throw new Error("引擎连接中断，任务已停止");
        }
        await sleep(2500);
        continue;
      }
      failures = 0;
      if (queueState === "pending") {
        onUpdate(
          updateTask(taskId, {
            status: "queued",
            progress: Math.max(progress, 8),
            backendPromptId: promptId,
            error: void 0,
          }),
        );
      } else {
        progress = Math.max(progress, 32);
        onUpdate(
          updateTask(taskId, {
            status: "running",
            progress,
            backendPromptId: promptId,
            error: void 0,
          }),
        );
      }
      await sleep(2500);
    }
  } catch (error) {
    const current = tasks.get(taskId);
    if (current?.status === "cancelled") return;
    onUpdate(
      updateTask(taskId, {
        status: "failed",
        progress: 0,
        error: error instanceof Error ? error.message : "工作流执行失败",
      }),
    );
  }
}

async function cancelCustomWorkflowTask(taskId) {
  const task = tasks.get(taskId);
  if (!task || task.kind !== "custom-workflow") return false;
  if (task.status === "queued" || task.status === "running") {
    if (task.backendPromptId) {
      await fetch(`${getBackendHost()}/queue`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ delete: [task.backendPromptId] }),
      }).catch(() => void 0);
      await fetch(`${getBackendHost()}/interrupt`, {
        method: "POST",
      }).catch(() => void 0);
    }
  }
  const cancelled = updateTask(taskId, {
    status: "cancelled",
    progress: 0,
    error: void 0,
  });
  send("tasks:update", cancelled);
  return true;
}

function registerWorkflowsIpc() {
  electron.ipcMain.handle("workflows:list", () => listCustomWorkflows());
  electron.ipcMain.handle("workflows:inspect", (_event, filePath) =>
    inspectCustomWorkflowFile(filePath),
  );
  electron.ipcMain.handle("workflows:validate", (_event, filePath) =>
    validateCustomWorkflowFile(filePath),
  );
  electron.ipcMain.handle("workflows:run", (_event, request) =>
    runCustomWorkflowTask(request, (task) => send("tasks:update", task)),
  );
  electron.ipcMain.handle("workflows:cancel", (_event, taskId) =>
    cancelCustomWorkflowTask(taskId),
  );
}
function registerWorkspaceSystemIpc() {
  electron.ipcMain.handle("workspace:get", () => getWorkspaceSettings());
  electron.ipcMain.handle("workspace:save", (_event, input) => {
    const settings = saveWorkspaceSettings(input);
    // 输出路径配置变化后，同步 Serpent 资源管理里的「ComfyUI 输出」链接。
    void serpentHost.ensureComfyuiOutputLink(settings.outputDir);
    return settings;
  });
  electron.ipcMain.handle(
    "workspace:pick-directory",
    async (_event, kind, currentPath) => {
      const result2 = await electron.dialog.showOpenDialog({
        title:
          kind === "models"
            ? "选择本地模型文件夹"
            : kind === "comfyui"
              ? "选择 ComfyUI 安装目录"
              : "选择图片与视频输出文件夹",
        defaultPath: currentPath || void 0,
        properties: ["openDirectory", "createDirectory"],
      });
      return result2.canceled ? "" : result2.filePaths[0];
    },
  );
  electron.ipcMain.handle("system:usage", () => getSystemUsage());
  electron.ipcMain.handle("system:app-icon", (_event, theme) => {
    const iconName =
      theme === "light" ? "yuh-studio-light.ico" : "yuh-studio-dark.ico";
    const iconPath = electron.app.isPackaged
      ? node_path.join(process.resourcesPath, iconName)
      : node_path.join(electron.app.getAppPath(), "build", iconName);
    return node_fs.existsSync(iconPath) ? iconPath : "";
  });
  electron.ipcMain.handle("system:toggle-devtools", () => {
    const mainWindow2 = getMainWindow();
    if (mainWindow2 && !mainWindow2.isDestroyed()) {
      if (mainWindow2.webContents.isDevToolsOpened())
        mainWindow2.webContents.closeDevTools();
      else mainWindow2.webContents.openDevTools({ mode: "detach" });
    }
  });
  electron.ipcMain.handle("window:set-theme", (_event, theme) => {
    const mainWindow2 = getMainWindow();
    mainWindow2?.setTitleBarOverlay({
      // 与渲染端 --bg 完全一致，避免系统窗口按钮区域看起来像另一块色板。
      color: theme === "light" ? "#eff1f3" : "#0b0d10",
      symbolColor: theme === "light" ? "#20262d" : "#e8ecf1",
      height: 38,
    });
  });
}
function registerShellIpc() {
  electron.ipcMain.handle("shell:open-path", (_event, targetPath) =>
    electron.shell.openPath(targetPath),
  );
  electron.ipcMain.handle("shell:show-item", (_event, targetPath) =>
    electron.shell.showItemInFolder(targetPath),
  );
  electron.ipcMain.handle("shell:save-item", async (_event, sourcePath) => {
    const fileName = sourcePath.split(/[\\/]/).pop() || "韵绘导出";
    const result2 = await electron.dialog.showSaveDialog({
      title: "下载保存",
      defaultPath: fileName,
      filters: [
        { name: "文件", extensions: [fileName.split(".").pop() || "*"] },
      ],
    });
    if (result2.canceled || !result2.filePath) return { canceled: true };
    node_fs.copyFileSync(sourcePath, result2.filePath);
    return { canceled: false, path: result2.filePath };
  });
}
function registerSharingIpc() {
  electron.ipcMain.handle("sharing:start", async (_event, port) => {
    const result2 = await startSharing(port || 18080);
    return { active: true, port: result2.port, urls: result2.urls, clients: 0 };
  });
  electron.ipcMain.handle("sharing:stop", () => {
    stopSharing();
    return true;
  });
  electron.ipcMain.handle("sharing:status", () => getSharingStatus());
  electron.ipcMain.handle("sharing:broadcast-canvas", (_event, project) => {
    broadcastCanvasUpdate(project);
    return true;
  });
  electron.ipcMain.handle("canvas:remote-update", (_event, _project) => {
    return true;
  });
}
const filePath = () =>
  node_path.join(electron.app.getPath("userData"), "close-behavior.json");
function readCloseBehavior() {
  try {
    const value = JSON.parse(node_fs.readFileSync(filePath(), "utf8")).behavior;
    return value === "tray" || value === "quit" ? value : "ask";
  } catch {
    return "ask";
  }
}
function saveCloseBehavior(behavior) {
  const normalized =
    behavior === "tray" || behavior === "quit" ? behavior : "ask";
  node_fs.mkdirSync(node_path.dirname(filePath()), { recursive: true });
  node_fs.writeFileSync(
    filePath(),
    JSON.stringify({ behavior: normalized }, null, 2),
    "utf8",
  );
  return normalized;
}
function registerCloseBehaviorIpc() {
  electron.ipcMain.handle("app-lifecycle:get-close-behavior", () =>
    readCloseBehavior(),
  );
  electron.ipcMain.handle(
    "app-lifecycle:set-close-behavior",
    (_event, behavior) => saveCloseBehavior(behavior),
  );
}
const RH_BASE = "https://www.runninghub.cn";
const runningTasks = /* @__PURE__ */ new Map();
async function rhJson(path, body, apiKey) {
  const response = await fetch(`${RH_BASE}${path}`, {
    method: "POST",
    headers: { "content-type": "application/json", Host: "www.runninghub.cn" },
    body: JSON.stringify({ ...body, apiKey }),
    signal: AbortSignal.timeout(6e4),
  });
  const data = await response.json().catch(() => ({}));
  if (
    !response.ok ||
    (data.code !== void 0 && ![0, 804, 813].includes(data.code))
  )
    throw new Error(
      `RunningHub 请求失败（${data.code ?? response.status}）：${data.msg || response.statusText}`,
    );
  return data;
}
async function uploadAsset(filePath2, apiKey) {
  const form = new FormData();
  form.append("apiKey", apiKey);
  form.append("fileType", "input");
  const bytes = await promises.readFile(filePath2);
  form.append("file", new Blob([bytes]), node_path.basename(filePath2));
  const response = await fetch(`${RH_BASE}/task/openapi/upload`, {
    method: "POST",
    body: form,
    signal: AbortSignal.timeout(12e4),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok || data.code !== 0 || !data.data?.fileName)
    throw new Error(
      `RunningHub 素材上传失败：${data.msg || response.statusText}`,
    );
  return data.data.fileName;
}
function outputKind(url) {
  const ext = node_path.extname(url.split("?")[0]).toLowerCase();
  if ([".mp4", ".webm", ".mov", ".mkv"].includes(ext)) return "video";
  if ([".mp3", ".wav", ".flac", ".m4a", ".ogg"].includes(ext)) return "audio";
  return "image";
}
async function runRunningHub(request) {
  const apiKey = getProviderApiKey(request.providerId);
  if (!apiKey)
    throw new Error("未配置 RunningHub API Key，请在中转站设置中保存密钥");
  if (!request.workflowJson && !request.webappId.trim())
    throw new Error("请填写 RunningHub AI 应用 ID，或粘贴 ComfyUI 工作流 JSON");
  const started = Date.now();
  const uploaded = /* @__PURE__ */ new Map();
  const state2 = { providerId: request.providerId, cancelled: false };
  if (request.requestId) runningTasks.set(request.requestId, state2);
  for (const file of request.files || [])
    uploaded.set(file, await uploadAsset(file, apiKey));
  const nodeInfoList = request.nodeInfoList.map((item) => ({
    ...item,
    fieldValue: uploaded.get(String(item.fieldValue)) || item.fieldValue,
  }));
  const workflow = request.workflowJson
    ? JSON.parse(JSON.stringify(request.workflowJson), (_key, value) => {
        const match =
          typeof value === "string" ? /^\$input(\d+)$/.exec(value) : null;
        return match
          ? uploaded.get(String((request.files || [])[Number(match[1])])) ||
              value
          : value;
      })
    : void 0;
  const submitted = workflow
    ? await rhJson(
        "/task/openapi/comfy/run",
        {
          workflow,
          addMetadata: true,
          instanceType: request.instanceType || "plus",
        },
        apiKey,
      )
    : await rhJson(
        "/task/openapi/ai-app/run",
        {
          webappId: request.webappId.trim(),
          nodeInfoList,
          taskType: "ASYNC",
          instanceType: request.instanceType || "plus",
        },
        apiKey,
      );
  const taskId = String(submitted.data?.taskId || "");
  if (!taskId) throw new Error("RunningHub 未返回任务 ID");
  state2.taskId = taskId;
  for (let attempt = 0; attempt < 480; attempt += 1) {
    await new Promise((resolve) => setTimeout(resolve, 5e3));
    if (state2.cancelled) throw new Error("RunningHub 任务已取消");
    const status = await rhJson("/task/openapi/outputs", { taskId }, apiKey);
    if (status.code === 804 || status.code === 813) continue;
    if (status.code !== 0)
      throw new Error(
        `RunningHub 任务失败（${status.code}）：${status.msg || "未知错误"}`,
      );
    const raw = Array.isArray(status.data)
      ? status.data
      : status.data?.outputs ||
        status.data?.results ||
        (status.data ? [status.data] : []);
    const outputs = [];
    for (let index = 0; index < raw.length; index += 1) {
      const url = String(raw[index]?.fileUrl || raw[index]?.url || "");
      if (!url) continue;
      const kind = outputKind(url);
      const response = await fetch(url, { signal: AbortSignal.timeout(3e5) });
      if (!response.ok)
        throw new Error(`RunningHub 输出下载失败（${response.status}）`);
      const buffer = Buffer.from(await response.arrayBuffer());
      const ext =
        node_path.extname(new URL(url).pathname) ||
        (kind === "video" ? ".mp4" : kind === "audio" ? ".wav" : ".png");
      const dir = node_path.join(configuredOutputDir(), "RunningHub");
      await promises.mkdir(dir, { recursive: true });
      const path = node_path.join(
        dir,
        `runninghub-${Date.now()}-${index}${ext}`,
      );
      await promises.writeFile(path, buffer);
      outputs.push({ path, url, name: node_path.basename(path), kind });
    }
    if (!outputs.length)
      throw new Error("RunningHub 任务已完成，但没有可下载的输出文件");
    if (request.requestId) runningTasks.delete(request.requestId);
    return { taskId, outputs, elapsedMs: Date.now() - started };
  }
  if (request.requestId) runningTasks.delete(request.requestId);
  throw new Error("RunningHub 任务等待超时（40分钟）");
}
async function cancelRunningHub(requestId) {
  const state2 = runningTasks.get(requestId);
  if (!state2) return false;
  state2.cancelled = true;
  if (state2.taskId) {
    const apiKey = getProviderApiKey(state2.providerId);
    if (apiKey)
      await rhJson(
        "/task/openapi/cancel",
        { taskId: state2.taskId },
        apiKey,
      ).catch(() => void 0);
  }
  runningTasks.delete(requestId);
  return true;
}
function registerRunningHubIpc() {
  electron.ipcMain.handle("runninghub:run", (_event, request) =>
    runRunningHub(request),
  );
  electron.ipcMain.handle("runninghub:cancel", (_event, requestId) =>
    cancelRunningHub(requestId),
  );
}
const jobs = /* @__PURE__ */ new Map();
function base(value) {
  return (value.trim() || "http://127.0.0.1:8188").replace(/\/+$/, "");
}
function kindFor(name) {
  const ext = node_path.extname(name).toLowerCase();
  return [".mp4", ".webm", ".mov", ".mkv"].includes(ext)
    ? "video"
    : [".mp3", ".wav", ".flac", ".m4a", ".ogg"].includes(ext)
      ? "audio"
      : "image";
}
async function json(url, init) {
  const response = await fetch(url, {
    ...init,
    signal: AbortSignal.timeout(6e4),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok)
    throw new Error(
      `本地 ComfyUI 请求失败（${response.status}）：${data.error || response.statusText}`,
    );
  return data;
}
async function upload(baseUrl, file) {
  const form = new FormData();
  form.append(
    "image",
    new Blob([await promises.readFile(file)]),
    node_path.basename(file),
  );
  form.append("overwrite", "true");
  const data = await json(`${baseUrl}/upload/image`, {
    method: "POST",
    body: form,
  });
  return String(data.name || "");
}
async function runLocalComfy(request) {
  const root = base(request.baseUrl);
  const started = Date.now();
  const state2 = { baseUrl: root, cancelled: false };
  if (request.requestId) jobs.set(request.requestId, state2);
  try {
    const uploaded = /* @__PURE__ */ new Map();
    for (const file of request.files || [])
      uploaded.set(file, await upload(root, file));
    const workflow = JSON.parse(
      JSON.stringify(request.workflow),
      (_key, value) => {
        const match =
          typeof value === "string" ? /^\$input(\d+)$/.exec(value) : null;
        return match
          ? uploaded.get(String((request.files || [])[Number(match[1])])) ||
              value
          : value;
      },
    );
    const inputEntries = (request.files || [])
      .map((path) => ({ path, name: uploaded.get(path) }))
      .filter((item) => Boolean(item.name));
    const usedInputs = /* @__PURE__ */ new Set();
    for (const entry of Object.values(workflow)) {
      const classType = String(entry?.class_type || "").toLowerCase();
      const inputKind = classType.includes("video")
        ? "video"
        : classType.includes("audio")
          ? "audio"
          : classType === "loadimage"
            ? "image"
            : "";
      if (!inputKind || !entry.inputs || typeof entry.inputs !== "object")
        continue;
      const index = inputEntries.findIndex(
        (item, itemIndex) =>
          !usedInputs.has(itemIndex) &&
          (inputKind === "image"
            ? !/\.(mp4|webm|mov|mkv|mp3|wav|flac|m4a|ogg)$/i.test(item.path)
            : inputKind === "video"
              ? /\.(mp4|webm|mov|mkv)$/i.test(item.path)
              : /\.(mp3|wav|flac|m4a|ogg)$/i.test(item.path)),
      );
      if (index < 0) continue;
      const key =
        inputKind === "image"
          ? "image"
          : inputKind === "video"
            ? "video"
            : "audio";
      if (
        typeof entry.inputs[key] === "string" &&
        !/^\$input\d+$/.test(entry.inputs[key])
      )
        entry.inputs[key] = inputEntries[index].name;
      usedInputs.add(index);
    }
    const prompt = JSON.parse(JSON.stringify(workflow), (_key, value) =>
      value === "$prompt" ? request.promptText || "" : value,
    );
    const submitted = await json(`${root}/prompt`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ prompt, client_id: node_crypto.randomUUID() }),
    });
    const promptId = String(submitted.prompt_id || "");
    if (!promptId) throw new Error("本地 ComfyUI 未返回 prompt_id");
    state2.promptId = promptId;
    for (let attempt = 0; attempt < 1200; attempt += 1) {
      await new Promise((resolve) => setTimeout(resolve, 2e3));
      if (state2.cancelled) throw new Error("本地 ComfyUI 任务已取消");
      const history = await json(
        `${root}/history/${encodeURIComponent(promptId)}`,
      );
      const record = history[promptId];
      if (!record) continue;
      if (record.status?.status_str === "error")
        throw new Error(
          record.status?.messages?.find(
            (item) => item?.[0] === "execution_error",
          )?.[1]?.exception_message || "本地 ComfyUI 工作流执行失败",
        );
      if (!record.status?.completed && !record.outputs) continue;
      const outputs = [];
      const outputDir2 = node_path.join(configuredOutputDir(), "ComfyUI");
      const outputItems = Object.values(record.outputs || {}).flatMap((entry) =>
        ["images", "gifs", "videos", "audio", "files"].flatMap((key) =>
          Array.isArray(entry?.[key]) ? entry[key] : [],
        ),
      );
      for (const item of outputItems) {
        if (!item?.filename) continue;
        const kind = kindFor(item.filename);
        const query = new URLSearchParams({
          filename: item.filename,
          subfolder: item.subfolder || "",
          type: item.type || "output",
        });
        const response = await fetch(`${root}/view?${query}`, {
          signal: AbortSignal.timeout(3e5),
        });
        if (!response.ok) continue;
        await promises.mkdir(outputDir2, { recursive: true });
        const path = node_path.join(
          outputDir2,
          `comfy-${Date.now()}-${outputs.length}${node_path.extname(item.filename)}`,
        );
        await promises.writeFile(
          path,
          Buffer.from(await response.arrayBuffer()),
        );
        outputs.push({
          path,
          url: `${root}/view?${query}`,
          name: node_path.basename(path),
          kind,
        });
      }
      if (outputs.length) {
        if (request.requestId) jobs.delete(request.requestId);
        return { promptId, outputs, elapsedMs: Date.now() - started };
      }
    }
    throw new Error("本地 ComfyUI 任务等待超时（40分钟）");
  } finally {
    if (request.requestId) jobs.delete(request.requestId);
  }
}
async function cancelLocalComfy(requestId) {
  const state2 = jobs.get(requestId);
  if (!state2) return false;
  state2.cancelled = true;
  if (state2.promptId) {
    await fetch(`${state2.baseUrl}/queue`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ delete: [state2.promptId] }),
    }).catch(() => void 0);
    await fetch(`${state2.baseUrl}/interrupt`, { method: "POST" }).catch(
      () => void 0,
    );
  }
  jobs.delete(requestId);
  return true;
}
function registerLocalComfyIpc() {
  electron.ipcMain.handle("local-comfy:run", (_event, request) =>
    runLocalComfy(request),
  );
  electron.ipcMain.handle("local-comfy:cancel", (_event, requestId) =>
    cancelLocalComfy(requestId),
  );
}
electron.app.commandLine.appendSwitch("no-sandbox");
electron.app.commandLine.appendSwitch("disable-gpu-sandbox");
electron.app.commandLine.appendSwitch("disable-direct-composition");
electron.app.commandLine.appendSwitch(
  "disable-features",
  "DirectCompositionVideoOverlays",
);
// Serpent embedded smoke: keep GPU path alive so utilityProcess worker spawn
// does not race (SERPENT_E2E uses SwiftShader hardware-accel fallback anyway).
if (process.env.YUH_SERPENT_GPU !== "1") {
  electron.app.disableHardwareAcceleration();
}
electron.app.setName("YUH Studio");
const hasSingleInstanceLock = electron.app.requestSingleInstanceLock();
if (!hasSingleInstanceLock) electron.app.quit();
electron.Menu.setApplicationMenu(
  electron.Menu.buildFromTemplate([
    {
      label: "编辑",
      submenu: [
        { role: "undo", label: "撤销" },
        { role: "redo", label: "重做" },
        { type: "separator" },
        { role: "cut", label: "剪切" },
        { role: "copy", label: "复制" },
        { role: "paste", label: "粘贴" },
        { role: "selectAll", label: "全选" },
      ],
    },
  ]),
);
let tray = null;
let quittingRequested = false;
let persistenceReadyToQuit = false;
let closePromptOpen = false;
function ensureTray() {
  if (tray && !tray.isDestroyed()) return;
  if (tray?.isDestroyed()) tray = null;
  const iconPath = electron.app.isPackaged
    ? node_path.join(process.resourcesPath, "yunhui.ico")
    : node_path.join(electron.app.getAppPath(), "build", "yunhui.ico");
  tray = new electron.Tray(iconPath);
  tray.setToolTip("韵绘 YUH Studio — 后台运行中");
  const menu = electron.Menu.buildFromTemplate([
    { label: "打开韵绘", click: () => showMainWindow() },
    { type: "separator" },
    {
      label: "退出",
      click: () => {
        quittingRequested = true;
        electron.app.quit();
      },
    },
  ]);
  tray.setContextMenu(menu);
  tray.on("double-click", () => showMainWindow());
}
function showMainWindow() {
  const mainWindow2 = getMainWindow();
  if (!mainWindow2 || mainWindow2.isDestroyed()) {
    createWindow();
    return;
  }
  if (mainWindow2.isMinimized()) mainWindow2.restore();
  mainWindow2.show();
  mainWindow2.focus();
}
electron.app.on("second-instance", () => showMainWindow());
function createWindow() {
  const iconPath = electron.app.isPackaged
    ? node_path.join(process.resourcesPath, "yunhui.ico")
    : node_path.join(electron.app.getAppPath(), "build", "yunhui.ico");
  const mainWindow2 = new electron.BrowserWindow({
    width: 1540,
    height: 980,
    minWidth: 1180,
    minHeight: 760,
    backgroundColor: "#0b0d10",
    title: "YUH Studio",
    icon: iconPath,
    titleBarStyle: "hidden",
    titleBarOverlay: {
      color: "#0b0d10",
      symbolColor: "#e8ecf1",
      height: 38,
    },
    show: false,
    autoHideMenuBar: true,
    webPreferences: {
      preload: node_path.join(__dirname, "../preload/index.js"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
      // dev 模式下渲染进程从 http://localhost 加载，需要关闭 webSecurity 才能访问 file:// 本地图片/视频
      webSecurity: !utils.is.dev,
    },
  });
  setMainWindow(mainWindow2);
  mainWindow2.once("ready-to-show", () => {
    if (process.env.YUNHUI_AUTOSTART === "1") {
      ensureTray();
      return;
    }
    mainWindow2?.show();
  });
  mainWindow2.webContents.setWindowOpenHandler(({ url }) => {
    if (/^https?:\/\//i.test(url)) void electron.shell.openExternal(url);
    return { action: "deny" };
  });
  mainWindow2.webContents.session.setPermissionRequestHandler(
    (_webContents, permission, callback) =>
      callback(permission === "local-fonts"),
  );
  mainWindow2.webContents.session.setPermissionCheckHandler(
    (_webContents, permission) => permission === "local-fonts",
  );
  mainWindow2.on("close", (event) => {
    if (quittingRequested || persistenceReadyToQuit) return;
    const behavior = readCloseBehavior();
    if (behavior === "quit") {
      event.preventDefault();
      quittingRequested = true;
      electron.app.quit();
      return;
    }
    event.preventDefault();
    const hideToTray = () => {
      if (tray && !tray.isDestroyed()) tray.destroy();
      tray = null;
      ensureTray();
      mainWindow2.hide();
    };
    if (behavior === "tray") {
      hideToTray();
      return;
    }
    if (closePromptOpen) return;
    closePromptOpen = true;
    void electron.dialog
      .showMessageBox(mainWindow2, {
        type: "question",
        title: "关闭 YUH Studio",
        message: "关闭主窗口后，希望软件怎样运行？",
        detail:
          "你的选择只提醒这一次，以后可以在“软件设置”里随时修改。最小化到托盘后，生成、下载和局域网共享可继续运行。",
        buttons: ["最小化到托盘", "彻底退出", "取消"],
        defaultId: 0,
        cancelId: 2,
        noLink: true,
      })
      .then(({ response }) => {
        if (response === 0) {
          saveCloseBehavior("tray");
          hideToTray();
        } else if (response === 1) {
          saveCloseBehavior("quit");
          quittingRequested = true;
          electron.app.quit();
        }
      })
      .finally(() => {
        closePromptOpen = false;
      });
  });
  mainWindow2.on("minimize", () => {
    ensureTray();
  });
  mainWindow2.webContents.on("render-process-gone", (_event, details) => {
    console.error(
      "[YUNHUI] renderer process exited:",
      details.reason,
      details.exitCode,
    );
    if (
      details.reason !== "clean-exit" &&
      mainWindow2 &&
      !mainWindow2.isDestroyed()
    ) {
      setTimeout(
        () => mainWindow2 && !mainWindow2.isDestroyed() && mainWindow2.reload(),
        500,
      );
    }
  });
  if (utils.is.dev && process.env.ELECTRON_RENDERER_URL) {
    void mainWindow2.loadURL(process.env.ELECTRON_RENDERER_URL);
  } else {
    // 默认使用从原程序提取的完整界面；TSX 迁移页面只通过 start:ui 显式启动。
    const legacyRendererIndex = node_path.join(__dirname, "../renderer/index.html");
    void mainWindow2.loadFile(legacyRendererIndex);
  }
  // 首屏完成后：注入 Serpent 侧边栏“资源管理”入口（legacy UI 与 TSX UI 均注入，
  // 注入脚本会等 .left-rail nav 出现才插入按钮）。
  mainWindow2.webContents.on("did-finish-load", () => {
    serpentSidebar.inject(mainWindow2.webContents);
  });
}
function registerIpc() {
  registerFileIpc();
  registerCanvasWorkflowIpc();
  registerAutoStartIpc();
  registerRecognitionIpc();
  registerSpeechIpc();
  registerAiProviderIpc();
  registerUtilitiesIpc();
  registerBackendIpc();
  registerWorkspaceSystemIpc();
  registerStorageIpc();
  registerShellIpc();
  registerSharingIpc();
  registerCloseBehaviorIpc();
  registerRunningHubIpc();
  registerLocalComfyIpc();
  registerWorkflowsIpc();
  registerSerpentIpc();
  registerReplacementStudioIpc();
  registerStoryWorkflowIpc();
  registerMediaToolIpc();
  registerVoiceStudioIpc();
  registerPipelineIpc();
}
function registerSerpentIpc() {
  electron.ipcMain.handle("serpent:status", () => serpentHost.getState());
  electron.ipcMain.handle("serpent:toggle", async () => {
    // 侧栏「资源管理」按钮走 toggle；显示后必须同步输出链接，否则
    // 「生成资产 / ComfyUI 输出」会停留在旧路径（用户改过输出目录也不生效）。
    const visible = await serpentHost.toggle();
    if (visible) {
      void serpentHost.ensureComfyuiOutputLink(outputDir());
    }
    return visible;
  });
  electron.ipcMain.handle("serpent:open-view", async (_event, viewId) => {
    // 「替换工作室」等嵌入视图入口：先显示 Serpent 视图再通知渲染层切换。
    const ok = await serpentHost.openView(viewId);
    if (ok) {
      void serpentHost.ensureComfyuiOutputLink(outputDir());
    }
    return ok;
  });
  electron.ipcMain.handle("serpent:show", async () => {
    const ok = await serpentHost.show();
    if (ok) {
      // 打开资源管理时同步「ComfyUI 输出」链接文件夹（无副作用：幂等）。
      void serpentHost.ensureComfyuiOutputLink(outputDir());
    }
    return ok;
  });
  electron.ipcMain.handle("serpent:hide", () => serpentHost.hide());
  electron.ipcMain.handle("serpent:report-layout", (_event, layout) => {
    serpentHost.setRailWidthPx(
      layout && layout.railWidth,
      layout && layout.railLeft,
      layout && layout.bodyTop,
    );
    return true;
  });
  electron.ipcMain.handle("workbench:tree", () => workbenchResourceTree());
  electron.ipcMain.handle("workbench:ensure-project-dir", (_event, subdir) =>
    workbenchEnsureProjectDir(subdir),
  );
  electron.ipcMain.handle("workbench:delete-project", (_event, studio, projectId) => workbenchDeleteProject(studio, projectId));
  serpentHost.onState((state) => {
    const win = getMainWindow();
    if (win && !win.isDestroyed()) {
      win.webContents.send("serpent:status-changed", state);
    }
  });
}

/**
 * 替换工作室 (Replacement Studio) host bridge。
 * Serpent 渲染层(嵌入视图)经其 preload 调用 rs:* 通道;复用主进程既有
 * 能力(云端图片/视频生成、视觉对话检测、文件选择、抽帧、缩略图),
 * 项目持久化位于 <userData>/serpent/replacement-studio。
 */
function replacementStudioDir() {
  return node_path.join(
    electron.app.getPath("userData"),
    "serpent",
    "replacement-studio",
  );
}
function replacementStudioIndexFile() {
  return node_path.join(replacementStudioDir(), "projects.json");
}
function replacementStudioProjectFile(id) {
  const safe = String(id || "").replace(/[^\w-]/g, "_");
  return node_path.join(replacementStudioDir(), `${safe}.json`);
}
function replacementStudioReadIndex() {
  try {
    const parsed = JSON.parse(
      node_fs.readFileSync(replacementStudioIndexFile(), "utf8"),
    );
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}
function replacementStudioWriteIndex(list) {
  node_fs.mkdirSync(replacementStudioDir(), { recursive: true });
  node_fs.writeFileSync(
    replacementStudioIndexFile(),
    JSON.stringify(list, null, 2),
    "utf8",
  );
}

/**
 * 工作台资源树(供给 Serpent 侧栏「工作台资源」分级)。每个工作室是一个分级,
 * 其下是按项目划分的资源目录。路径与云端生成一致:
 *   输出根/<工作室>/<项目id>/
 * 只返回真实存在项目元数据的工作室(替换工作室来自 projects.json)。后续
 * 剧本工作室等可在此追加。
 */
function workbenchResourceTree() {
  const outputRoot = configuredOutputDir() || outputDir();
  const studios = [];
  const rsProjects = replacementStudioReadIndex().map((meta) => ({
    id: String(meta.id || ""),
    title: String(meta.title || "未命名替换项目"),
    dir: node_path.join(outputRoot, "替换工作室", String(meta.id || "")),
  }));
  // 分类始终存在(即使暂无项目),侧栏才能在对应分级下新增/展示项目目录。
  studios.push({
    studio: "替换工作室",
    slug: "replacement-studio",
    projects: rsProjects,
  });
  return studios;
}

/**
 * 确保工作台项目资源目录存在(输出根/<项目子目录>),供剧本工作室等在
 * 打开工作台时立即建立项目目录,资源管理「工作台资源」也能立刻显示该项目。
 * 校验子目录不能越出输出根,防止目录穿越。
 */
function workbenchEnsureProjectDir(subdir) {
  const outputRoot = configuredOutputDir() || outputDir();
  const safe = String(subdir || "")
    .replace(/\\/g, "/")
    .replace(/^\/+/, "")
    .trim();
  if (!safe) return { ok: false, error: "缺少项目子目录" };
  const rootResolved = node_path.resolve(outputRoot);
  const resolved = node_path.resolve(outputRoot, safe);
  if (
    resolved !== rootResolved &&
    !resolved.startsWith(rootResolved + node_path.sep)
  ) {
    return { ok: false, error: "非法项目目录" };
  }
  try {
    node_fs.mkdirSync(resolved, { recursive: true });
    return { ok: true, dir: resolved };
  } catch (error) {
    return { ok: false, error: String((error && error.message) || error) };
  }
}
function workbenchDeleteProject(studio, projectId) {
  const outputRoot = configuredOutputDir() || outputDir();
  const safeStudio = String(studio || "").trim();
  const safeId = String(projectId || "").trim();
  if (!safeStudio || !safeId) return { ok: false, error: "缺少项目标识" };
  const rootResolved = node_path.resolve(outputRoot);
  const resolved = node_path.resolve(outputRoot, safeStudio, safeId);
  if (!resolved.startsWith(rootResolved + node_path.sep)) return { ok: false, error: "非法项目目录" };
  try {
    node_fs.rmSync(resolved, { recursive: true, force: true });
    return { ok: true, dir: resolved };
  } catch (error) {
    return { ok: false, error: String((error && error.message) || error) };
  }
}
function replacementStudioMeta(project) {
  const p = project || {};
  return {
    id: String(p.id || ""),
    title: String(p.title || "未命名替换项目"),
    updatedAt: String(p.updatedAt || /* @__PURE__ */ new Date().toISOString()),
  };
}
async function registerReplacementStudioIpc() {
  const handlers = {
    "rs:projects-load": () => {
      const out = [];
      for (const meta of replacementStudioReadIndex()) {
        try {
          const project = JSON.parse(
            node_fs.readFileSync(
              replacementStudioProjectFile(meta.id),
              "utf8",
            ),
          );
          if (project && typeof project === "object") out.push(project);
        } catch {
          // 单文件损坏不影响其它项目
        }
      }
      return { projects: out };
    },
    "rs:project-save": (projectOrLibrary) => {
      // 迁移版 ShuoCanvas 的自动保存器提交的是项目库容器({ projects: [...] }),
      // 新版 React 工作室提交的是单个项目。两种格式都要支持。
      const projects = Array.isArray(projectOrLibrary?.projects)
        ? projectOrLibrary.projects
        : projectOrLibrary?.project && typeof projectOrLibrary.project === "object"
          ? [projectOrLibrary.project]
          : [projectOrLibrary];
      const validProjects = projects.filter(
        (project) => project && typeof project === "object" && project.id,
      );
      // 空项目库是合法的初始状态(用户尚未创建可持久化项目),直接视为成功。
      if (!validProjects.length) {
        if (Array.isArray(projectOrLibrary?.projects)) return { ok: true };
        throw new Error("无效的项目数据");
      }
      try {
        node_fs.mkdirSync(replacementStudioDir(), { recursive: true });
        const indexById = new Map(
          replacementStudioReadIndex().map((item) => [item.id, item]),
        );
        for (const project of validProjects) {
          const meta = replacementStudioMeta(project);
          node_fs.writeFileSync(
            replacementStudioProjectFile(meta.id),
            JSON.stringify(project, null, 2),
            "utf8",
          );
          indexById.set(meta.id, meta);
          // 项目一创建就建立其专属资源目录,资源管理「工作台资源」才能立刻
          // 出现该项目文件夹(经「ComfyUI 输出」链接递归收录)并只显示本项目资源。
          try {
            node_fs.mkdirSync(
              node_path.join(
                configuredOutputDir() || outputDir(),
                "替换工作室",
                meta.id,
              ),
              { recursive: true },
            );
          } catch {
            // 输出目录不可写时忽略,不影响项目元数据保存。
          }
        }
        replacementStudioWriteIndex([...indexById.values()]);
        return { ok: true };
      } catch (error) {
        return {
          ok: false,
          error: String((error && error.message) || error),
        };
      }
    },
    "rs:project-delete": (id) => {
      replacementStudioWriteIndex(
        replacementStudioReadIndex().filter((item) => item.id !== id),
      );
      try {
        node_fs.unlinkSync(replacementStudioProjectFile(id));
      } catch {}
      const deleted = workbenchDeleteProject("替换工作室", id);
      return deleted.ok ? { ok: true } : deleted;
    },
    "rs:detect-people": async (request) => {
      if (!request || !request.providerId || !request.imagePath)
        throw new Error("人物检测参数不足（请选择中转站并确认基础图已就绪）");
      const result = await sendVisionChat({
        providerId: request.providerId,
        model: String(request.model || "").trim() || "vision",
        prompt:
          String(request.prompt || "").trim() ||
          "列出图片中所有人物及其位置框",
        imagePaths: [request.imagePath],
      });
      return { text: extractChatText(result) };
    },
    "rs:save-data-image": async (request) => {
      if (!request || !request.dataUrl) throw new Error("缺少图片数据");
      const match = /^data:image\/[\w.+-]+;base64,(.+)$/s.exec(
        String(request.dataUrl),
      );
      if (!match || !match[1]) throw new Error("图片数据格式无效");
      const tmp = node_path.join(replacementStudioDir(), "tmp");
      node_fs.mkdirSync(tmp, { recursive: true });
      const name = String(request.name || "image").replace(/[^\w.-]+/g, "_");
      const target = node_path.join(
        tmp,
        `${name}-${/* @__PURE__ */ Date.now()}.png`,
      );
      node_fs.writeFileSync(target, Buffer.from(match[1], "base64"));
      return { path: target };
    },
    "rs:extract-frame": async (request) => {
      if (!request || !request.file) throw new Error("缺少视频文件");
      const root =
        outputDir() ||
        node_path.join(
          electron.app.getPath("userData"),
          "replacement-studio-frames",
        );
      return extractVideoFrame({
        file: request.file,
        outputDir: request.outputDir && request.outputDir.trim()
          ? request.outputDir
          : root,
        position: request.position === "last" ? "last" : "first",
      });
    },
    // ── v2:素材探测 / 智能裁剪 / 定时抽帧 / 片段素材化 / 转写 / 克隆 / 合成 ──
    "rs:probe": async (request) => {
      if (!request || !request.file || !node_fs.existsSync(request.file))
        throw new Error("素材文件不存在");
      const ffmpegBin = rsFfmpeg();
      const probe = await rsRunFfmpeg(ffmpegBin, [
        "-i",
        request.file,
        "-f",
        "null",
        "-",
      ]);
      const stderr = probe.stderr;
      const durationMatch = stderr.match(/Duration:\s*(\d+):(\d+):(\d+(?:\.\d+)?)/);
      const durationSec = durationMatch
        ? parseInt(durationMatch[1]) * 3600 +
          parseInt(durationMatch[2]) * 60 +
          parseFloat(durationMatch[3])
        : null;
      const sizeMatch = stderr.match(/Video:.*?\s(\d{2,5})x(\d{2,5})/);
      const inputFormat =
        (stderr.match(/Input #0, ([^,\n]+)/) || [])[1] || "";
      const isVideo =
        !/(png_pipe|image2|jpeg_pipe|webp_pipe|bmp_pipe|tiff_pipe|gif|pam_pipe)/i.test(
          inputFormat,
        ) && /Video:\s/.test(stderr);
      return {
        durationSec,
        width: sizeMatch ? parseInt(sizeMatch[1]) : 0,
        height: sizeMatch ? parseInt(sizeMatch[2]) : 0,
        isVideo,
      };
    },
    "rs:smart-clip": async (request) => {
      if (!request || !request.file || !node_fs.existsSync(request.file))
        throw new Error("视频文件不存在");
      const threshold =
        typeof request.threshold === "number" && request.threshold > 0
          ? request.threshold
          : 0.24;
      const ffmpegBin = rsFfmpeg();
      const probe = await rsRunFfmpeg(ffmpegBin, [
        "-i",
        request.file,
        "-f",
        "null",
        "-",
      ]);
      const durationMatch = probe.stderr.match(
        /Duration:\s*(\d+):(\d+):(\d+(?:\.\d+)?)/,
      );
      const durationSec = durationMatch
        ? parseInt(durationMatch[1]) * 3600 +
          parseInt(durationMatch[2]) * 60 +
          parseFloat(durationMatch[3])
        : 0;
      if (durationSec <= 0) throw new Error("无法读取视频时长");
      const detect = await rsRunFfmpeg(ffmpegBin, [
        "-i",
        request.file,
        "-vf",
        `select='gt(scene,${threshold})',showinfo`,
        "-f",
        "null",
        "-",
      ]);
      const cuts = [];
      for (const match of detect.stderr.matchAll(/pts_time:(\d+(?:\.\d+)?)/g)) {
        const t = parseFloat(match[1]);
        if (Number.isFinite(t) && t > 0.2 && t < durationSec - 0.2)
          cuts.push(t);
      }
      const boundaries = [
        0,
        ...[...new Set(cuts.map((t) => Math.round(t * 100) / 100))].sort(
          (a, b) => a - b,
        ),
        Math.round(durationSec * 100) / 100,
      ];
      const minDuration = request.minDuration || 0.8;
      const shots = [];
      for (let i = 0; i < boundaries.length - 1; i += 1) {
        const start = boundaries[i];
        const end = boundaries[i + 1];
        const dur = Math.round((end - start) * 100) / 100;
        if (dur < minDuration) continue;
        shots.push({
          startSec: start,
          endSec: end,
          durationSec: dur,
          keyframeTimeSec:
            Math.round((start + Math.min(0.6, dur * 0.35)) * 100) / 100,
        });
      }
      if (shots.length === 0) {
        shots.push({
          startSec: 0,
          endSec: durationSec,
          durationSec: Math.round(durationSec * 100) / 100,
          keyframeTimeSec: 0,
        });
      }
      return { durationSec, shots };
    },
    "rs:extract-frame-at": async (request) => {
      if (!request || !request.file) throw new Error("缺少视频文件");
      const outputDir2 =
        request.outputDir ||
        outputDir() ||
        node_path.join(
          electron.app.getPath("userData"),
          "replacement-studio-frames",
        );
      node_fs.mkdirSync(outputDir2, { recursive: true });
      const target = uniqueOutput(outputDir2, `keyframe-${Date.now()}.png`);
      const result2 = await rsRunFfmpeg(rsFfmpeg(), [
        "-y",
        "-ss",
        String(Math.max(0, Number(request.timeSec) || 0)),
        "-i",
        request.file,
        "-frames:v",
        "1",
        "-update",
        "1",
        "-vf",
        "scale='min(1600,iw)':-2",
        target,
      ]);
      if (!result2.ok || !node_fs.existsSync(target)) {
        throw new Error(
          (result2.stderr || "").trim().split(/\r?\n/).slice(-3).join("\n") ||
            "抽取关键帧失败",
        );
      }
      return { path: target };
    },
    "rs:materialize-shot": async (request) => {
      if (!request || !request.file || !node_fs.existsSync(request.file))
        throw new Error("源视频不存在");
      const outputDir2 =
        request.outputDir ||
        outputDir() ||
        node_path.join(
          electron.app.getPath("userData"),
          "replacement-studio-clips",
        );
      node_fs.mkdirSync(outputDir2, { recursive: true });
      const start = Math.max(0, Number(request.startSec) || 0);
      const duration = Math.max(0.3, Number(request.durationSec) || 1);
      const target = uniqueOutput(outputDir2, `shot-${Date.now()}.mp4`);
      const args = [
        "-y",
        "-ss",
        start.toFixed(3),
        "-i",
        request.file,
        "-t",
        duration.toFixed(3),
        "-c:v",
        "libx264",
        "-preset",
        "veryfast",
        "-crf",
        "20",
        "-c:a",
        "aac",
        "-b:a",
        "128k",
      ];
      if (request.reverse) {
        // 倒放(切口剪辑器):reverse 滤镜作用于裁出的片段。
        args.splice(args.indexOf("-c:v"), 0, "-vf", "reverse");
      }
      args.push(target);
      const result2 = await rsRunFfmpeg(rsFfmpeg(), args);
      if (!result2.ok || !node_fs.existsSync(target))
        throw new Error(
          (result2.stderr || "").trim().split(/\r?\n/).slice(-3).join("\n") ||
            "裁切镜头片段失败",
        );
      return { path: target, durationSec: duration };
    },
    "rs:extract-shot-audio": async (request) => {
      if (!request || !request.file || !node_fs.existsSync(request.file))
        throw new Error("源视频不存在");
      const outputDir2 =
        request.outputDir ||
        outputDir() ||
        node_path.join(
          electron.app.getPath("userData"),
          "replacement-studio-voice",
        );
      node_fs.mkdirSync(outputDir2, { recursive: true });
      const start = Math.max(0, Number(request.startSec) || 0);
      const duration = Math.max(0.3, Number(request.durationSec) || 1);
      const target = uniqueOutput(outputDir2, `shot-audio-${Date.now()}.wav`);
      const result2 = await rsRunFfmpeg(rsFfmpeg(), [
        "-y",
        "-ss",
        start.toFixed(3),
        "-i",
        request.file,
        "-t",
        duration.toFixed(3),
        "-vn",
        "-acodec",
        "pcm_s16le",
        target,
      ]);
      if (!result2.ok || !node_fs.existsSync(target))
        throw new Error(
          (result2.stderr || "").trim().split(/\r?\n/).slice(-3).join("\n") ||
            "提取镜头原声失败",
        );
      return { path: target, durationSec: duration };
    },
    "rs:transcribe": async (request) => {
      if (!request || !request.audioPath || !request.providerId)
        throw new Error("参数不足(缺少音频或中转站)");
      const result2 = await transcribeWhisper({
        audioPath: request.audioPath,
        providerId: request.providerId,
        model: request.model || "whisper-1",
        responseFormat: "text",
        language: request.language || "zh",
      });
      return {
        text: String(result2?.text || ""),
        outputPath: result2?.outputPath || null,
      };
    },
    "rs:clone-voice": async (request) => {
      if (!request || !request.text || !request.refAudioPath)
        throw new Error("参数不足(缺少台词或音色参考)");
      const root =
        outputDir() ||
        node_path.join(
          electron.app.getPath("userData"),
          "replacement-studio-voice",
        );
      const result2 = await indexTtsClone({
        text: request.text,
        refAudioPath: request.refAudioPath,
        lang: request.lang || "zh",
        outputDir: request.outputDir || root,
      });
      if (result2.error) throw new Error(String(result2.error));
      return { outputPath: result2.outputPath };
    },
    "rs:save-file-dialog": async (request) => {
      const result2 = await electron.dialog.showSaveDialog({
        title: request && request.title ? request.title : "保存文件",
        defaultPath:
          request && request.defaultName ? request.defaultName : "替换结果.mp4",
        filters: request && Array.isArray(request.filters)
          ? request.filters
          : [{ name: "视频", extensions: ["mp4", "mov", "webm"] }],
      });
      return result2.canceled ? "" : result2.filePath;
    },
    "rs:compose": async (request) => {
      if (!request || !Array.isArray(request.shots) || request.shots.length === 0)
        throw new Error("没有可合成的镜头");
      const outputDir2 = node_path.dirname(
        String(request.outputPath || ""),
      );
      if (!outputDir2) throw new Error("输出路径不合法");
      node_fs.mkdirSync(outputDir2, { recursive: true });
      const ffmpegBin = rsFfmpeg();
      const tempDir = node_path.join(
        node_os.tmpdir(),
        `rs-compose-${Date.now()}`,
      );
      node_fs.mkdirSync(tempDir, { recursive: true });
      try {
        const parts = [];
        for (let i = 0; i < request.shots.length; i += 1) {
          const shot = request.shots[i];
          const target = node_path.join(
            tempDir,
            `part-${String(i).padStart(3, "0")}.mp4`,
          );
          const partArgs = ["-y", "-i", shot.videoPath];
          partArgs.push(
            "-c:v",
            "libx264",
            "-preset",
            "veryfast",
            "-crf",
            "20",
          );
          if (shot.audioPath && node_fs.existsSync(shot.audioPath)) {
            // 克隆音轨:apad 补足镜头时长后替换原声。
            partArgs.push(
              "-i",
              shot.audioPath,
              "-filter_complex",
              "[1:a]apad[a]",
              "-map",
              "0:v",
              "-map",
              "[a]",
              "-c:a",
              "aac",
              "-b:a",
              "128k",
            );
          } else {
            partArgs.push("-c:a", "aac", "-b:a", "128k");
          }
          partArgs.push("-t", String(shot.durationSec || 1));
          partArgs.push(target);
          const part = await rsRunFfmpeg(ffmpegBin, partArgs);
          if (!part.ok || !node_fs.existsSync(target))
            throw new Error(
              "镜头片段转码失败:" + (part.stderr || "").slice(-200),
            );
          parts.push(target);
        }
        const listFile = node_path.join(tempDir, "list.txt");
        node_fs.writeFileSync(
          listFile,
          parts.map((p) => `file '${p.replace(/\\/g, "/")}'`).join("\n"),
          "utf8",
        );
        const concatArgs = [
          "-y",
          "-f",
          "concat",
          "-safe",
          "0",
          "-i",
          listFile,
          "-c:v",
          "libx264",
          "-preset",
          "veryfast",
          "-crf",
          "20",
          "-c:a",
          "aac",
          "-b:a",
          "128k",
        ];
        concatArgs.push(request.outputPath);
        const concat = await rsRunFfmpeg(ffmpegBin, concatArgs);
        if (!concat.ok || !node_fs.existsSync(request.outputPath))
          throw new Error(
            (concat.stderr || "").trim().split(/\r?\n/).slice(-4).join("\n") ||
              "合成视频失败",
          );
        return { outputPath: request.outputPath };
      } finally {
        try {
          node_fs.rmSync(tempDir, { recursive: true, force: true });
        } catch {}
      }
    },
  };
  for (const [channel, handler] of Object.entries(handlers)) {
    electron.ipcMain.handle(channel, (_event, ...args) =>
      handler(...args),
    );
  }
}

/**
 * 剧本工作室 · 阶段1 (storyboard-script) host bridge。
 * Serpent 渲染层经其 preload 调用 sw:* 通道:分镜 JSON 由前端
 * shared/storyboard-script 负责解析,主进程只做「中转站 chat 完成」+ 文本落盘。
 */
function storyboardDir() {
  return node_path.join(
    electron.app.getPath("userData"),
    "serpent",
    "storyboard-script",
  );
}
function storyboardWorkspaceFile() {
  return node_path.join(storyboardDir(), "workspace.json");
}
async function registerStoryWorkflowIpc() {
  const handlers = {
    "sw:load-workspace": async () => {
      try {
        return JSON.parse(node_fs.readFileSync(storyboardWorkspaceFile(), "utf8"));
      } catch (error) {
        if (error?.code === "ENOENT") return null;
        console.warn("[storyboard-script] 工作区存档读取失败", error);
        return null;
      }
    },
    "sw:save-workspace": async (workspace) => {
      if (!workspace || typeof workspace !== "object" || Array.isArray(workspace)) {
        throw new Error("无效的剧本工作室存档");
      }
      const file = storyboardWorkspaceFile();
      const temp = `${file}.${process.pid}.${Date.now()}.tmp`;
      node_fs.mkdirSync(storyboardDir(), { recursive: true });
      node_fs.writeFileSync(temp, JSON.stringify(workspace), "utf8");
      node_fs.renameSync(temp, file);
      return { ok: true };
    },
    "sw:generate-script": async (request) => {
      if (!request || !request.providerId || !request.model)
        throw new Error("参数不足(缺少中转站或模型)");
      if (!request.user || !String(request.user).trim())
        throw new Error("缺少故事/文案输入");
      const result = await sendChat({
        providerId: request.providerId,
        model: String(request.model),
        messages: [
          {
            role: "system",
            content: String(request.system || "").trim() || "你是专业的分镜脚本生成器。",
          },
          { role: "user", content: String(request.user) },
        ],
        temperature: 0.3,
        stream: false,
      });
      return {
        text: extractChatText(result),
        model: String(request.model),
        providerId: String(request.providerId),
      };
    },
    "sw:save-text": async (request) => {
      if (!request || typeof request.content !== "string" || !request.content.trim())
        throw new Error("没有可保存的内容");
      const dir = outputDir() && node_fs.existsSync(outputDir())
        ? outputDir()
        : storyboardDir();
      node_fs.mkdirSync(dir, { recursive: true });
      const name = String(request.name || "分镜脚本.txt").replace(/[\\/:*?"<>|]/g, "_");
      const target = node_path.join(dir, name);
      node_fs.writeFileSync(target, request.content, "utf8");
      return { path: target };
    },
    "sw:open-replacement-studio": async () => {
      // 剧本工作室 → 替换工作室 联动:先显示 Serpent 视图再切换子视图。
      const ok = await serpentHost.openView("replacement-studio");
      if (ok) {
        void serpentHost.ensureComfyuiOutputLink(outputDir());
      }
      return ok;
    },
  };
  for (const [channel, handler] of Object.entries(handlers)) {
    electron.ipcMain.handle(channel, (_event, ...args) =>
      handler(...args),
    );
  }
}

/**
 * 媒体工具(轻量工具坊) host bridge。
 * mt:* 通道直接代理主进程既有 utilities 能力(宫格拆分/拼图拼接/批注导出),
 * 输出目录复用「存储设置 → 输出文件夹」,落盘后 Serpent 生成资产自动可见。
 */
async function registerMediaToolIpc() {
  const handlers = {
    "mt:split-grid": async (request) => {
      if (!request || !request.file || !node_fs.existsSync(request.file))
        throw new Error("图片文件不存在");
      const rows = Math.max(1, Math.min(16, Math.round(Number(request.rows) || 1)));
      const cols = Math.max(1, Math.min(16, Math.round(Number(request.cols) || 1)));
      const dir = request.outputDir && String(request.outputDir).trim()
        ? String(request.outputDir)
        : outputDir() && node_fs.existsSync(outputDir())
          ? outputDir()
          : storyboardDir();
      return splitImages({
        files: [request.file],
        rows,
        cols,
        outputDir: dir,
        format: ["png", "jpg", "webp"].includes(request.format)
          ? request.format
          : "png",
        indexes: Array.isArray(request.indexes) ? request.indexes : void 0,
      });
    },
    "mt:stitch-grid": async (request) => {
      if (!request || !request.first || !request.second)
        throw new Error("拼图需要两张图片");
      if (!node_fs.existsSync(request.first) || !node_fs.existsSync(request.second))
        throw new Error("拼图图片不存在");
      const dir = request.outputDir && String(request.outputDir).trim()
        ? String(request.outputDir)
        : outputDir() && node_fs.existsSync(outputDir())
          ? outputDir()
          : storyboardDir();
      return stitchImages({
        first: request.first,
        second: request.second,
        direction: request.direction === "vertical" ? "vertical" : "horizontal",
        cropSecond: request.cropSecond === "manual" ? "manual" : "auto",
        cropRegion: request.cropRegion,
        outputDir: dir,
        format: ["png", "jpg", "webp"].includes(request.format)
          ? request.format
          : "png",
      });
    },
    "mt:save-annotation": async (request) => {
      if (!request || !request.dataUrl) throw new Error("缺少批注图像数据");
      const dir = request.outputDir && String(request.outputDir).trim()
        ? String(request.outputDir)
        : outputDir() && node_fs.existsSync(outputDir())
          ? outputDir()
          : storyboardDir();
      return saveCanvasAnnotation({
        dataUrl: request.dataUrl,
        sourceName: String(request.sourceName || "annotation"),
        outputDir: dir,
      });
    },
    "mt:collage": async (request) => {
      if (!request || !Array.isArray(request.files) || request.files.length < 2)
        throw new Error("拼图需要至少 2 张图片");
      const files = request.files.slice(0, 12);
      for (const file of files) {
        if (!node_fs.existsSync(file)) throw new Error(`图片不存在:${file}`);
      }
      const dir = request.outputDir && String(request.outputDir).trim()
        ? String(request.outputDir)
        : outputDir() && node_fs.existsSync(outputDir())
          ? outputDir()
          : storyboardDir();
      const format = ["png", "jpg", "webp"].includes(request.format)
        ? request.format
        : "png";
      // 布局:2 图按 direction;3+ 图自动近方形网格,最后一行靠左。
      const count = files.length;
      let cols;
      let rows;
      if (count === 2) {
        if (request.direction === "vertical") {
          cols = 1;
          rows = 2;
        } else {
          cols = 2;
          rows = 1;
        }
      } else {
        cols = Math.ceil(Math.sqrt(count));
        rows = Math.ceil(count / cols);
      }
      const buffers = [];
      const metas = [];
      for (const file of files) {
        const buffer = await sharp(file).rotate().toBuffer();
        const meta = await sharp(buffer).metadata();
        buffers.push(buffer);
        metas.push(meta);
      }
      const cellWidth = Math.max(...metas.map((meta) => meta.width || 1));
      const cellHeight = Math.max(...metas.map((meta) => meta.height || 1));
      const width = cellWidth * cols;
      const height = cellHeight * rows;
      const composite = files.map((file, index) => ({
        input: buffers[index],
        left: (index % cols) * cellWidth,
        top: Math.floor(index / cols) * cellHeight,
        width: cellWidth,
        height: cellHeight,
        fit: "cover",
        position: "centre",
      }));
      const canvas = sharp({
        create: {
          width,
          height,
          channels: 4,
          background: { r: 18, g: 20, b: 28, alpha: 1 },
        },
      }).composite(composite);
      const outputPath = node_path.join(
        dir,
        `${safeBase(files[0])}_collage_${/* @__PURE__ */ Date.now()}.${format}`,
      );
      if (format === "png") await canvas.png({ compressionLevel: 8 }).toFile(outputPath);
      if (format === "jpg")
        await canvas.jpeg({ quality: 96, mozjpeg: true }).toFile(outputPath);
      if (format === "webp") await canvas.webp({ quality: 96 }).toFile(outputPath);
      return result([outputPath], `拼图已生成(${count} 图 ${cols}×${rows})`);
    },
  };
  for (const [channel, handler] of Object.entries(handlers)) {
    electron.ipcMain.handle(channel, (_event, ...args) =>
      handler(...args),
    );
  }
}

/**
 * 语音工作室 (voice-studio) host bridge。
 * vs:* 通道复用主进程既有引擎:whisper 转写(verbose_json 分段)、
 * IndexTTS 克隆、TTS 音色设计、ffmpeg 抽音/合成;翻译走中转站 chat。
 */
async function registerVoiceStudioIpc() {
  const handlers = {
    "vs:status": async () => {
      const [tts, indextts] = await Promise.all([
        getTtsStatus().catch(() => null),
        getIndexTtsStatus().catch(() => null),
      ]);
      return { tts, indextts };
    },
    "vs:extract-audio": async (request) => {
      if (!request || !request.file || !node_fs.existsSync(request.file))
        throw new Error("视频文件不存在");
      const dir = request.outputDir && String(request.outputDir).trim()
        ? String(request.outputDir)
        : outputDir() && node_fs.existsSync(outputDir())
          ? outputDir()
          : storyboardDir();
      node_fs.mkdirSync(dir, { recursive: true });
      const target = uniqueOutput(dir, `${safeBase(request.file)}_audio.wav`);
      const run = await rsRunFfmpeg(rsFfmpeg(), [
        "-y",
        "-i",
        request.file,
        "-vn",
        "-acodec",
        "pcm_s16le",
        "-ar",
        "44100",
        "-ac",
        "2",
        target,
      ]);
      if (!run.ok || !node_fs.existsSync(target))
        throw new Error(
          (run.stderr || "").trim().split(/\r?\n/).slice(-3).join("\n") || "抽取音频失败",
        );
      return { path: target };
    },
    "vs:transcribe": async (request) => {
      if (!request || !request.file || !request.providerId)
        throw new Error("参数不足(缺少音频或中转站)");
      if (!node_fs.existsSync(request.file)) throw new Error("音频文件不存在");
      return transcribeWhisper({
        audioPath: request.file,
        providerId: request.providerId,
        model: request.model || "whisper-1",
        responseFormat: "verbose_json",
        language: request.language || "",
      });
    },
    "vs:clone-voice": async (request) => {
      if (!request || !request.text || !request.refAudioPath)
        throw new Error("参数不足(缺少台词或音色参考)");
      if (!node_fs.existsSync(request.refAudioPath))
        throw new Error("音色参考音频不存在");
      const root =
        outputDir() ||
        node_path.join(electron.app.getPath("userData"), "voice-studio");
      const result2 = await indexTtsClone({
        text: request.text,
        refAudioPath: request.refAudioPath,
        lang: request.lang || "zh",
        outputDir: request.outputDir || root,
        durationFactor: request.durationFactor ?? 1,
      });
      if (result2.error) throw new Error(String(result2.error));
      return { outputPath: result2.outputPath };
    },
    "vs:design-voice": async (request) => {
      if (!request || !request.text || !request.design)
        throw new Error("参数不足(缺少台词或音色设计描述)");
      const root =
        outputDir() ||
        node_path.join(electron.app.getPath("userData"), "voice-studio");
      const result2 = await ttsVoiceDesign({
        text: request.text,
        design: request.design,
        lang: request.lang || "zh",
        outputDir: request.outputDir || root,
      });
      if (result2.error) throw new Error(String(result2.error));
      return { outputPath: result2.outputPath };
    },
    "vs:translate": async (request) => {
      if (!request || !request.providerId || !request.model)
        throw new Error("参数不足(缺少中转站或模型)");
      if (!request.user || !String(request.user).trim())
        throw new Error("缺少待翻译文本");
      const result = await sendChat({
        providerId: request.providerId,
        model: String(request.model),
        messages: [
          {
            role: "system",
            content:
              String(request.system || "").trim() ||
              "你是专业的影视配音翻译,只输出 JSON。",
          },
          { role: "user", content: String(request.user) },
        ],
        temperature: 0.2,
        stream: false,
      });
      return { text: extractChatText(result) };
    },
    "vs:concat-audio": async (request) => {
      if (
        !request ||
        !Array.isArray(request.segments) ||
        request.segments.length === 0
      )
        throw new Error("没有可合成的配音段");
      for (const segment of request.segments) {
        if (
          !segment ||
          !segment.audioPath ||
          !node_fs.existsSync(segment.audioPath)
        )
          throw new Error("配音音频不存在(请先为分段配音)");
      }
      const dir = request.outputDir && String(request.outputDir).trim()
        ? String(request.outputDir)
        : outputDir() && node_fs.existsSync(outputDir())
          ? outputDir()
          : storyboardDir();
      node_fs.mkdirSync(dir, { recursive: true });
      const mixMode =
        request.mixMode === "keep-original" ? "keep-original" : "dub-all";
      const totalMs = Math.max(1000, Number(request.totalMs) || 1000);
      const basePath =
        mixMode === "keep-original" &&
        request.basePath &&
        node_fs.existsSync(request.basePath)
          ? request.basePath
          : null;
      const inputs = [];
      const parts = [];
      if (basePath) {
        inputs.push("-i", basePath);
      } else {
        inputs.push(
          "-f",
          "lavfi",
          "-t",
          (totalMs / 1000).toFixed(3),
          "-i",
          "anullsrc=r=44100:cl=stereo",
        );
      }
      parts.push("[0:a]aresample=44100[base]");
      const dubbed = [...request.segments].sort(
        (a, b) => Number(a.startMs || 0) - Number(b.startMs || 0),
      );
      const dubLabels = [];
      dubbed.forEach((segment, index) => {
        inputs.push("-i", segment.audioPath);
        const offsetMs = Math.max(0, Math.round(Number(segment.startMs) || 0));
        parts.push(`[${index + 1}:a]aresample=44100,adelay=${offsetMs}|${offsetMs}[d${index}]`);
        dubLabels.push(`[d${index}]`);
      });
      let filterLine;
      if (dubbed.length === 0) {
        filterLine = "[0:a]aresample=44100[out]";
      } else {
        const n = dubbed.length + 1;
        filterLine = `[base]${dubLabels.join("")}amix=inputs=${n}:duration=first:dropout_transition=0,volume=${n}[out]`;
      }
      const outputPath = uniqueOutput(
        dir,
        `voice-studio-${/* @__PURE__ */ Date.now()}.wav`,
      );
      const run = await rsRunFfmpeg(rsFfmpeg(), [
        "-y",
        ...inputs,
        "-filter_complex",
        filterLine,
        "-map",
        "[out]",
        "-c:a",
        "pcm_s16le",
        outputPath,
      ]);
      if (!run.ok || !node_fs.existsSync(outputPath))
        throw new Error(
          (run.stderr || "").trim().split(/\r?\n/).slice(-4).join("\n") || "合成音频失败",
        );
      return { outputPath, durationMs: totalMs };
    },
  };
  for (const [channel, handler] of Object.entries(handlers)) {
    electron.ipcMain.handle(channel, (_event, ...args) =>
      handler(...args),
    );
  }
}

/**
 * 成片流水线 glue(pipeline)host bridge。
 * pp:* 通道把「替换工作室视频 × 语音工作室音频」mux 成最终成片(音轨替换/补齐)。
 * 命令规格与 Serpent/src/shared/pipeline.ts::buildMuxArgs 保持一致。
 */
async function registerPipelineIpc() {
  const handlers = {
    "pp:mux-video": async (request) => {
      if (
        !request ||
        !request.videoPath ||
        !request.audioPath ||
        String(request.videoPath) === String(request.audioPath)
      )
        throw new Error("参数不足(缺少视频/音频,或两者相同)");
      if (!node_fs.existsSync(request.videoPath))
        throw new Error("视频文件不存在");
      if (!node_fs.existsSync(request.audioPath))
        throw new Error("音频文件不存在");
      const dir = request.outputDir && String(request.outputDir).trim()
        ? String(request.outputDir)
        : outputDir() && node_fs.existsSync(outputDir())
          ? outputDir()
          : storyboardDir();
      node_fs.mkdirSync(dir, { recursive: true });
      const videoCodec = String(request.videoCodec || "copy");
      const audioBitrate = String(request.audioBitrate || "192k");
      const syncToVideo = request.syncToVideo !== false;
      const outputPath = uniqueOutput(dir, `成片-${/* @__PURE__ */ Date.now()}.mp4`);
      const args = [
        "-y",
        "-i",
        request.videoPath,
        "-i",
        request.audioPath,
      ];
      if (syncToVideo) {
        const durationSec = await probeDuration(request.videoPath);
        if (!durationSec || durationSec <= 0)
          throw new Error("无法获取视频时长,无法对齐音轨");
        // apad 补齐音轨 + -t 限到视频时长(避免 apad 与 -shortest 组合挂起)。
        args.push("-filter_complex", "[1:a]apad[aout]");
        args.push("-map", "0:v:0");
        args.push("-map", "[aout]");
        args.push("-t", String(durationSec));
      } else {
        args.push("-map", "0:v:0", "-map", "1:a:0");
      }
      args.push("-c:v", videoCodec);
      args.push("-c:a", "aac", "-b:a", audioBitrate);
      args.push("-movflags", "+faststart");
      args.push(outputPath);
      const run = await rsRunFfmpeg(rsFfmpeg(), args);
      if (!run.ok || !node_fs.existsSync(outputPath))
        throw new Error(
          (run.stderr || "").trim().split(/\r?\n/).slice(-4).join("\n") || "成片导出失败",
        );
      return { outputPath };
    },
  };
  for (const [channel, handler] of Object.entries(handlers)) {
    electron.ipcMain.handle(channel, (_event, ...args) =>
      handler(...args),
    );
  }
}
if (process.argv.includes("--hidden")) {
  process.env.YUNHUI_AUTOSTART = "1";
}
electron.app.whenReady().then(() => {
  if (!hasSingleInstanceLock) return;
  registerIpc();
  archiveCanvasSnapshotOnStartup();
  const devToolsShortcut = electron.app.isPackaged
    ? "CommandOrControl+F12"
    : "F12";
  electron.globalShortcut.register(devToolsShortcut, () => {
    const currentWindow = getMainWindow();
    if (currentWindow && !currentWindow.isDestroyed()) {
      if (currentWindow.webContents.isDevToolsOpened())
        currentWindow.webContents.closeDevTools();
      else currentWindow.webContents.openDevTools({ mode: "detach" });
    }
  });
  if (process.env.YUNHUI_AUTOSTART === "1") ensureTray();
  createWindow();
  // 启动即推送生成记录（Serpent 资源管理可追溯 prompt/参数/模型/耗时）。
  try {
    pushGenerationRecords();
  } catch {}
  // Serpent 默认按需挂载：侧边栏“资源管理”入口点击后再显示嵌入视图。
  // 保留 YUH_SERPENT_AUTOMOUNT=1 以支持旧自动挂载 / smoke 验证路径。
  if (serpentHost.enabled() && process.env.YUH_SERPENT_AUTOMOUNT === "1") {
    void serpentHost.show();
  } else if (serpentHost.enabled()) {
    // Serpent 是 YUH 的内嵌模块：启动后后台预热 Worker/DB/渲染器，
    // 首次点击资源管理时只做挂载，不再承担模块初始化耗时。
    void serpentHost.prewarm();
  }
  try {
    if (readAutoStartSettings().autoShare) {
      let attempts = 0;
      const startAutoSharing = () => {
        startSharing(18080).catch(() => {
          attempts += 1;
          if (attempts < 6) {
            setTimeout(startAutoSharing, 1500);
          }
        });
      };
      setTimeout(startAutoSharing, 1200);
    }
  } catch {}
});
electron.app.on("before-quit", (event) => {
  void serpentHost.shutdown();
  if (!persistenceReadyToQuit) {
    event.preventDefault();
    stopBackend();
    stopVisionReverse().catch((error) =>
      console.warn("[quit] 停止视觉引擎失败:", error),
    );
    stopTts();
    stopIndexTts();
    stopSharing();
    electron.globalShortcut.unregisterAll();
    void Promise.all([flushTaskPersistence(), flushCanvasStorage()]).finally(
      () => {
        persistenceReadyToQuit = true;
        electron.app.quit();
      },
    );
  }
});
electron.app.on("window-all-closed", () => {
  if (process.platform !== "darwin" && quittingRequested) electron.app.quit();
});
