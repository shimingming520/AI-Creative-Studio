// Diagnose: music workflow inspect + validate + submit against remote backend, print verbatim body.
const wf = require("../dev-src/main/workflows.js");

const BACKEND = "http://127.0.0.1:8189";
const WORKFLOW =
  "F:\\Comfy-Desktop\\ComfyUI-Installs\\ComfyUI\\ComfyUI\\user\\default\\workflows\\音频\\文生音乐\\音乐生成minimax_music_3.json";

(async () => {
  const info = wf.inspectWorkflow(WORKFLOW);
  console.log("== inspect ==", "nodes:", info.nodeCount, "skipped:", info.skippedNodes, "isAudioGraph:", info.isAudioGraph);
  console.log("nodeTypes:", JSON.stringify(info.nodeTypes));
  console.log("textSlots:", JSON.stringify(info.textSlots));
  console.log("modelSlots:", JSON.stringify(info.modelSlots));
  console.log("fileSlots:", JSON.stringify(info.fileSlots));
  console.log("slots:", JSON.stringify(Object.fromEntries(
    Object.entries(info.slots).map(([k, v]) => [k, v.map((s) => `${s.nodeId}.${s.input}`)]),
  )));
  console.log("sample model values:", JSON.stringify(Object.values(info.api).slice(0, 6).map((n) => ({ id: n.id, cls: n.class_type, inputs: Object.fromEntries(Object.entries(n.inputs).filter(([k]) => /name|prompt|text|duration|seed/i.test(k)).map(([k, v]) => [k, typeof v === "string" ? v.slice(0, 60) : v])) })), null, 1));

  const pruned = wf.pruneUnreachable(info.api);
  // apply DEFAULT overrides (as the UI would without any text edits)
  const graph = wf.applyOverrides(pruned, info.slots, {
    prompt: undefined, duration: undefined, steps: undefined, cfg: undefined, seed: undefined,
    modelFiles: {}, textOverrides: {},
  });

  const validation = await wf.validateAgainstBackend(BACKEND, graph, info.modelSlots);
  console.log("\n== validate ==", "reachable:", validation.backendReachable);
  console.log("nodeIssues:", JSON.stringify(validation.nodeIssues, null, 1));
  console.log("modelIssues:", JSON.stringify((validation.modelIssues || []).map((i) => ({
    nodeId: i.nodeId, input: i.input, nodeTitle: i.nodeTitle, value: i.value, found: i.found, folder: i.folder, candidates: (i.candidates || []).slice(-4),
  })), null, 1));

  // submit verbatim
  const res = await fetch(`${BACKEND}/prompt`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt: graph, client_id: "diag-music3" }),
  });
  const body = await res.text();
  console.log("\n== POST /prompt status ==", res.status);
  console.log(body.slice(0, 2500));
})().catch((e) => { console.error("DIAG FAILED:", e); process.exit(1); });
