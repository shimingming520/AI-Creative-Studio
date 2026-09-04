// E2E: submit 音色设计/Qwen3 TTS声音设计 through the app's own workflows.js pipeline
// against the live remote backend, mirroring runCustomWorkflowTask + finalizeFromHistory.
const wf = require("../dev-src/main/workflows.js");
const path = require("path");
const fs = require("fs");

const BACKEND = "http://127.0.0.1:8189";
const WORKFLOW =
  "F:\\Comfy-Desktop\\ComfyUI-Installs\\ComfyUI\\ComfyUI\\user\\default\\workflows\\音频\\音色设计\\Qwen3 TTS声音设计.json";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

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
  console.log("== inspect ==");
  console.log("nodes:", info.nodeCount, "isAudioGraph:", info.isAudioGraph);
  console.log("textSlots:", JSON.stringify(info.textSlots));
  console.log("modelSlots:", JSON.stringify(info.modelSlots));
  console.log("fileSlots:", JSON.stringify(info.fileSlots));
  console.log("seed slots:", JSON.stringify(info.slots.seed));

  // --- mirror renderer hydrate + run -----------------------------------------
  const textValues = {};
  for (const slot of info.textSlots || []) {
    textValues[`${slot.nodeId}::${slot.input}`] = String(slot.value ?? "");
  }
  const primaryIndex = Math.max(0, (info.textSlots || []).findIndex(
    (s) => String(s.value ?? "").trim() !== "",
  ));
  const ps = info.textSlots[primaryIndex];
  textValues[`${ps.nodeId}::${ps.input}`] = "男低音，声音浑厚有磁性，语速缓慢的旁白音色，用于纪录片解说。";
  textValues["1::voice_design"] = "男声，中低音，语速平稳，略带沙哑，普通话，声音低沉且稍显疲惫";

  let graph = wf.pruneUnreachable(info.api);
  console.log("pruned:", Object.keys(info.api).length, "->", Object.keys(graph).length);
  const seed = 42424242;
  graph = wf.applyOverrides(graph, info.slots, {
    prompt: textValues[`${ps.nodeId}::${ps.input}`],
    duration: undefined,
    steps: undefined,
    cfg: undefined,
    seed,
    modelFiles: {},
    textOverrides: textValues,
  });
  graph = await wf.remapModelValues(graph, info.modelSlots, BACKEND);

  const sample = Object.values(graph).map((n) =>
    Object.entries(n.inputs || {}).filter(([k]) => /text|prompt|seed|design/i.test(k)),
  ).flat().slice(0, 6);
  console.log("== overridden sample ==");
  console.log(JSON.stringify(sample, null, 1));

  // quick node validation before submit
  const validation = await wf.validateAgainstBackend(BACKEND, graph, info.modelSlots);
  console.log("== validate ==", "reachable:", validation.backendReachable);
  if (validation.nodeIssues.length)
    console.log("nodeIssues:", validation.nodeIssues.map((i) => i.message).slice(0, 5));
  if (validation.modelIssues.length)
    console.log("modelIssues:", validation.modelIssues.map((i) => `${i.nodeTitle}.${i.input}=${i.value} found=${i.found}`).slice(0, 5));

  // --- submit ----------------------------------------------------------------
  const clientId = "e2e-audio-check";
  const queued = await requestJson(`${BACKEND}/prompt`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt: graph, client_id: clientId }),
  });
  if (!queued.prompt_id) {
    console.error("SUBMIT FAILED:", JSON.stringify(queued).slice(0, 800));
    process.exit(1);
  }
  console.log("== submitted ==", queued.prompt_id);

  // --- poll -------------------------------------------------------------------
  let record = null;
  for (let i = 0; i < 150; i++) {
    await sleep(5000);
    try {
      const history = await requestJson(`${BACKEND}/history/${queued.prompt_id}`);
      record = history[queued.prompt_id];
    } catch (e) {
      console.log(`poll@${i}: err ${e.message.slice(0, 120)}`);
      continue;
    }
    if (!record) { console.log(`poll@${i}: no record yet`); continue; }
    const st = record.status?.status_str;
    console.log(`poll@${i}: ${st}`);
    if (st === "error") {
      const msg = (record.status?.messages || []).find((m) => m?.[0] === "execution_error");
      console.error("EXECUTION ERROR:", JSON.stringify(msg?.[1] || record.status, null, 1).slice(0, 1400));
      process.exit(2);
    }
    if (record.status?.completed) break;
  }
  if (!record?.status?.completed) {
    console.error("TIMEOUT waiting for completion");
    // try cancel
    await requestJson(`${BACKEND}/queue`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ delete: [clientId] }) }).catch(() => {});
    process.exit(1);
  }

  // --- collect outputs --------------------------------------------------------
  const outputs = [];
  for (const nodeId of Object.keys(record.outputs || {})) {
    const out = record.outputs[nodeId];
    for (const key of ["images", "videos", "gifs", "audio", "files"]) {
      for (const item of out?.[key] || []) {
        outputs.push({ nodeId, key, filename: item.filename, subfolder: item.subfolder, type: item.type });
      }
    }
  }
  console.log("== outputs ==", JSON.stringify(outputs, null, 1));
  for (const o of outputs) {
    const candidates = [
      "F:\\Comfy-Desktop\\ComfyUI-Installs\\ComfyUI\\ComfyUI\\output",
      "F:\\Comfy-Desktop\\ComfyUI-Shared\\output",
    ].map((base) => path.join(base, o.subfolder || "", o.filename));
    const found = candidates.find((c) => fs.existsSync(c));
    console.log(`  ${o.key}/${o.filename} (${o.type}): ${found ? "EXISTS " + found : "not found in " + candidates.join(" | ")}`);
  }
})().catch((e) => {
  console.error("E2E FAILED:", e);
  process.exit(1);
});
