// 单测：用真实工作流文件验证 扫描/转换/槽位/校验
const wf = require("../dev-src/main/workflows.js");
const path = require("path");

const COMFY = "F:\\Comfy-Desktop\\ComfyUI-Installs\\ComfyUI\\ComfyUI";

(async () => {
  const { root, items } = wf.listWorkflows(COMFY);
  console.log("== listWorkflows ==");
  console.log("root:", root);
  console.log("count:", items.length);
  for (const item of items.slice(0, 12)) {
    console.log(`  [${item.format}] ${item.relName} (${item.nodeCount ?? "?"} nodes)${item.error ? " ERROR:" + item.error : ""}`);
  }

  const targets = items.filter((i) => /MiniMaxH3|krea2|Krea2|wan21/i.test(i.relName));
  for (const target of targets) {
    console.log("\n==================================================");
    console.log("WORKFLOW:", target.relName);
    const info = wf.inspectWorkflow(target.path);
    console.log("format:", info.format, "nodes:", info.nodeCount, "skipped:", info.skippedNodes);
    if (info.warnings.length) console.log("warnings:", info.warnings.slice(0, 5));
    console.log("slotValues:", JSON.stringify(info.slotValues));
    console.log("slots:", JSON.stringify(Object.fromEntries(
      Object.entries(info.slots).map(([k, v]) => [k, v.map((s) => `${s.nodeId}.${s.input}(${s.label})`)]),
    ), null, 1));
    console.log("modelSlots:", JSON.stringify(info.modelSlots));
    console.log("fileSlots:", JSON.stringify(info.fileSlots));
    console.log("outputNodes:", JSON.stringify(info.outputNodes));

    // 覆盖测试：把提示词/宽高/步数/种子改成面板值
    const overridden = wf.applyOverrides(info.api, info.slots, {
      prompt: "测试提示词",
      width: 1280,
      height: 720,
      steps: 12,
      seed: 12345,
    });
    console.log("overrides applied, sample:", JSON.stringify(
      Object.values(overridden).map((n) => Object.entries(n.inputs || {}).filter(([k]) => /prompt|width|height|steps|seed/i.test(k))).flat().slice(0, 8),
    ));

    // 实时校验（引擎在 8190）——先做可达性剪枝，去掉未连接的死分支
    const pruned = wf.pruneUnreachable(info.api);
    console.log("pruned nodes:", Object.keys(info.api).length, "->", Object.keys(pruned).length);
    const validation = await wf.validateAgainstBackend("http://127.0.0.1:8190", pruned, info.modelSlots);
    console.log("validation backendReachable:", validation.backendReachable);
    if (validation.nodeIssues.length) console.log("  nodeIssues:", validation.nodeIssues.map((i) => i.message));
    for (const issue of validation.modelIssues.slice(0, 5)) {
      console.log(`  model ${issue.input}@${issue.nodeTitle}: ${issue.value} -> found=${issue.found} folder=${issue.folder} candidates=${(issue.candidates || []).length}`);
    }
  }
})().catch((error) => {
  console.error("TEST FAILED:", error);
  process.exit(1);
});
