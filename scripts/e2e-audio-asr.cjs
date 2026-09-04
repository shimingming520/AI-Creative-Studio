// E2E: 语音转文本 (Qwen3-ASR) — upload audio ref, run via workflows.js pipeline, verify text output.
const wf = require("../dev-src/main/workflows.js");
const path = require("path");
const fs = require("fs");

const BACKEND = "http://127.0.0.1:8189";
const WORKFLOW =
  "F:\\Comfy-Desktop\\ComfyUI-Installs\\ComfyUI\\ComfyUI\\user\\default\\workflows\\音频\\语音转文本\\推理-音频提取字幕-Qwen3-ASR.json";
const SRC_AUDIO =
  "F:\\Comfy-Desktop\\ComfyUI-Installs\\ComfyUI\\ComfyUI\\temp\\ComfyUI_temp_bilpl_00001.flac";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function uploadAudio(filePath) {
  const buf = fs.readFileSync(filePath);
  const fd = new FormData();
  fd.append("image", new Blob([buf], { type: "audio/flac" }), "speech_e2e.flac");
  const res = await fetch(
    `${BACKEND}/upload/image?type=input&subfolder=h3-e2e-asr&overwrite=true`,
    { method: "POST", body: fd },
  );
  const text = await res.text();
  if (!res.ok) throw new Error("upload failed: " + res.status + " " + text.slice(0, 300));
  return JSON.parse(text);
}

async function requestJson(url, options) {
  const res = await fetch(url, options);
  const text = await res.text();
  let body;
  try { body = JSON.parse(text); } catch { body = text; }
  if (!res.ok) throw new Error(`${res.status} ${text.slice(0, 300)}`);
  return body;
}

(async () => {
  const info = wf.inspectWorkflow(WORKFLOW);
  console.log("== inspect ==", "nodes:", info.nodeCount, "fileSlots:", JSON.stringify(info.fileSlots));
  let graph = wf.pruneUnreachable(info.api);
  graph = wf.applyOverrides(graph, info.slots, {
    prompt: undefined, duration: undefined, steps: undefined, cfg: undefined, seed: undefined,
    modelFiles: {}, textOverrides: {},
  });

  // upload + assign (mirror uploadReference + assignUploadedFiles)
  const uploaded = await uploadAudio(SRC_AUDIO);
  console.log("== uploaded ==", JSON.stringify(uploaded));
  const assignedName = [uploaded.subfolder, uploaded.name].filter(Boolean).join("/");
  graph = wf.assignUploadedFiles(graph, info.fileSlots, [{ kind: "audio", name: assignedName }]);
  const audioInput = Object.values(graph).map((n) => n.inputs?.audio).filter(Boolean);
  console.log("audio inputs after assign:", JSON.stringify(audioInput));

  const validation = await wf.validateAgainstBackend(BACKEND, graph, info.modelSlots);
  console.log("== validate ==", "reachable:", validation.backendReachable,
    "nodeIssues:", validation.nodeIssues.map((i) => i.message).slice(0, 4));

  const queued = await requestJson(`${BACKEND}/prompt`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt: graph, client_id: "e2e-asr-check" }),
  });
  if (!queued.prompt_id) { console.error("SUBMIT FAILED:", JSON.stringify(queued).slice(0, 600)); process.exit(1); }
  console.log("== submitted ==", queued.prompt_id);

  let record = null;
  for (let i = 0; i < 150; i++) {
    await sleep(5000);
    try {
      const history = await requestJson(`${BACKEND}/history/${queued.prompt_id}`);
      record = history[queued.prompt_id];
    } catch (e) { console.log(`poll@${i}: err ${e.message.slice(0, 100)}`); continue; }
    if (!record) continue;
    const st = record.status?.status_str;
    console.log(`poll@${i}: ${st}`);
    if (st === "error") {
      const msg = (record.status?.messages || []).find((m) => m?.[0] === "execution_error");
      console.error("EXECUTION ERROR:", JSON.stringify(msg?.[1] || record.status, null, 1).slice(0, 1400));
      process.exit(2);
    }
    if (record.status?.completed) break;
  }
  if (!record?.status?.completed) { console.error("TIMEOUT"); process.exit(1); }

  // ---- replicate finalizeFromHistory candidate collection --------------------
  console.log("== history outputs keys ==");
  const candidates = [];
  for (const nodeId of Object.keys(record.outputs || {})) {
    const out = record.outputs[nodeId];
    console.log(`  node ${nodeId}: ${Object.keys(out || {}).join(", ")}`);
    for (const key of ["images", "videos", "gifs", "audio", "files", "text"]) {
      for (const item of out?.[key] || []) candidates.push({ nodeId, key, ...item });
    }
  }
  console.log("candidates:", JSON.stringify(candidates.map((c) => ({ nodeId: c.nodeId, key: c.key, filename: c.filename, subfolder: c.subfolder, type: c.type }))));
  for (const c of candidates) {
    const abs = path.join(
      "F:\\Comfy-Desktop\\ComfyUI-Installs\\ComfyUI\\ComfyUI\\output",
      c.subfolder || "", c.filename,
    );
    console.log(`  ${c.filename} -> ${fs.existsSync(abs) ? "EXISTS " + abs : "missing"}`);
  }
  // read first line of the txt if found
  const txt = candidates.find((c) => /\.(txt|srt|vtt|json)$/i.test(c.filename || ""));
  if (txt) {
    const abs = path.join("F:\\Comfy-Desktop\\ComfyUI-Installs\\ComfyUI\\ComfyUI\\output", txt.subfolder || "", txt.filename);
    if (fs.existsSync(abs)) {
      const content = fs.readFileSync(abs, "utf8");
      console.log("== TXT CONTENT (first 400 chars) ==");
      console.log(content.slice(0, 400));
    }
  }
})().catch((e) => { console.error("E2E FAILED:", e); process.exit(1); });
