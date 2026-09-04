// Verify IndexTTS submit after required-input completion (cancel right after queueing).
const wf = require("../dev-src/main/workflows.js");
const fs = require("fs");

const BACKEND = "http://127.0.0.1:8189";
const WORKFLOW =
  "F:\\Comfy-Desktop\\ComfyUI-Installs\\ComfyUI\\ComfyUI\\user\\default\\workflows\\音频\\语音生成\\乱神版-超好用Easy+IndexTTS2无限组合版(单人).json";
const REF = "F:\\Comfy-Desktop\\ComfyUI-Shared\\output\\ComfyUI_temp_itajf_00001.flac";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

(async () => {
  const info = wf.inspectWorkflow(WORKFLOW);
  console.log("fileSlots:", JSON.stringify(info.fileSlots));
  let graph = wf.pruneUnreachable(info.api);
  graph = wf.applyOverrides(graph, info.slots, {
    prompt: undefined, duration: undefined, steps: undefined, cfg: undefined, seed: undefined,
    modelFiles: {}, textOverrides: {},
  });
  // upload ref
  const buf = fs.readFileSync(REF);
  const fd = new FormData();
  fd.append("image", new Blob([buf], { type: "audio/flac" }), "ref_idx.flac");
  const upRes = await fetch(`${BACKEND}/upload/image?type=input&subfolder=h3-e2e-idx&overwrite=true`, { method: "POST", body: fd });
  const uploaded = await upRes.json();
  console.log("uploaded:", JSON.stringify(uploaded));
  const name = [uploaded.subfolder, uploaded.name].filter(Boolean).join("/");
  graph = wf.assignUploadedFiles(graph, info.fileSlots, [{ kind: "audio", name }]);
  graph = await wf.completeRequiredInputs(graph, info.raw, BACKEND);
  const validation = await wf.validateAgainstBackend(BACKEND, graph, info.modelSlots);
  console.log("validate reachable:", validation.backendReachable, "nodeIssues:", JSON.stringify(validation.nodeIssues));

  const res = await fetch(`${BACKEND}/prompt`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt: graph, client_id: "e2e-idxtts-diag" }),
  });
  const body = await res.text();
  console.log("POST /prompt:", res.status);
  console.log(body.slice(0, 900));
  if (res.ok) {
    const pid = JSON.parse(body).prompt_id;
    console.log("QUEUED:", pid);
    await sleep(1200);
    await fetch(`${BACKEND}/interrupt`, { method: "POST" }).catch(() => {});
    await fetch(`${BACKEND}/queue`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ delete: [pid, "e2e-idxtts-diag"] }),
    }).catch(() => {});
    console.log("cancelled (interrupt + queue delete)");
  }
})().catch((e) => { console.error("TEST FAILED:", e); process.exit(1); });
