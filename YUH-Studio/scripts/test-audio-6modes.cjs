// Verify the 6 audio modes catalogue + slots for the two new workflows.
const wf = require("../dev-src/main/workflows.js");
const path = require("path");

const COMFY = "F:\\Comfy-Desktop\\ComfyUI-Installs\\ComfyUI\\ComfyUI";
const { items } = wf.listWorkflows(COMFY);

const MODES = [
  { id: "voice", title: "语音生成", folder: "语音生成", rootRe: /语音|tts|voxcpm|qwen3|voice|克隆/i },
  { id: "voiceDesign", title: "音色设计", folder: "音色设计", rootRe: /音色|voice.?design|声音设计/i },
  { id: "music", title: "音乐生成", folder: "文生音乐", rootRe: /音乐|music/i },
  { id: "sfx", title: "音效生成", folder: "文生音效", rootRe: /音效|woosh|sound|sfx|拟声/i },
  { id: "vocalSplit", title: "人声分离", folder: "人声分离", rootRe: /人声|分离|vocal|stem|伴奏/i },
  { id: "asr", title: "语音转文本", folder: "语音转文本", rootRe: /转文本|转文字|ASR|字幕|transcri|语音识别/i },
];

function itemsForMode(mode) {
  const list = Array.isArray(items) ? items : [];
  const category = list.filter((i) => String(i.relName || "").split("/")[0] === "音频");
  const sub = category.filter((i) => String(i.relName || "").split("/")[1] === mode.folder);
  const root = list.filter(
    (i) => !String(i.relName || "").includes("/") && mode.rootRe.test(i.relName || "") && !/视频|数字人|FL2VA|小鲸鱼|生视频/i.test(i.relName || ""),
  );
  const combined = [...sub, ...root];
  return combined.length ? combined : category;
}

console.log("== 6 modes catalogue ==");
let unassigned = new Set(items.map((i) => i.relName));
for (const m of MODES) {
  const found = itemsForMode(m);
  console.log(`[${m.title}] -> ${found.length} items`);
  for (const f of found) console.log(`   - ${f.relName}${f.error ? " ERROR:" + f.error : ""}`);
  for (const f of found) unassigned.delete(f.relName);
}
console.log("not covered by any mode:", [...unassigned].filter((r) => r.split("/")[0] === "音频" || !r.includes("/")).join(" | ") || "(none)");

for (const rel of ["音频/人声分离/人声背景音分离.json", "音频/语音转文本/推理-音频提取字幕-Qwen3-ASR.json", "人声背景音分离进阶版.json"]) {
  const item = items.find((i) => i.relName === rel);
  if (!item) { console.log("MISSING ITEM:", rel); continue; }
  console.log("\n== inspect:", rel, "==");
  const info = wf.inspectWorkflow(item.path);
  console.log("formats/nodes:", info.format, info.nodeCount, "isAudioGraph:", info.isAudioGraph);
  console.log("textSlots:", JSON.stringify(info.textSlots));
  console.log("fileSlots:", JSON.stringify(info.fileSlots));
  console.log("modelSlots:", JSON.stringify(info.modelSlots));
  console.log("outputNodes:", JSON.stringify(info.outputNodes));
}
