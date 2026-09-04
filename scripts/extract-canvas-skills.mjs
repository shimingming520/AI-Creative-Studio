// Extract canvas-agent skill contents (BUILTIN_SKILLS + drama pipeline prompts)
// from the bundled renderer asset into a readable markdown doc.
import { readFileSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const bundlePath = join(root, "dev-src", "renderer", "assets", "index-B9rdyvCR.js");
const src = readFileSync(bundlePath, "utf8");

function grabConst(name) {
  const re = new RegExp(`const ${name} = \`([\\s\\S]*?)\`;`);
  const m = src.match(re);
  if (!m) throw new Error(`const ${name} not found`);
  return m[1];
}

function grabArray(name) {
  const re = new RegExp(`const ${name} = (\\[[\\s\\S]*?\\n\\]);`);
  const m = src.match(re);
  if (!m) throw new Error(`const ${name} not found`);
  // array literal of plain JS object literals -> evaluate safely (keys unquoted)
  return new Function(`return ${m[1]}`)();
}

const builtins = grabArray("BUILTIN_SKILLS");
const prompts = {
  COMIC_STAGE_A_PROMPT: grabConst("COMIC_STAGE_A_PROMPT"),
  COMIC_STAGE_A_METADATA_REPAIR_PROMPT: grabConst("COMIC_STAGE_A_METADATA_REPAIR_PROMPT"),
  SCREENPLAY_ADAPT_PROMPT: grabConst("SCREENPLAY_ADAPT_PROMPT"),
  SOL_SHOT_PLAN_PROMPT: grabConst("SOL_SHOT_PLAN_PROMPT"),
};

const lines = [];
lines.push("# YUH Studio 画布助手 · Skill 内容（从打包产物提取）");
lines.push("");
lines.push(`> 来源文件：\`YUH-Studio/dev-src/renderer/assets/index-B9rdyvCR.js\`（legacy 副本：\`YUH-Studio/ui-src/legacy/assets/index-B9rdyvCR.js\`）`);
lines.push(`> 提取时间：${new Date().toISOString()}`);
lines.push("");

lines.push("## 1. 内置 Skill 列表（下拉菜单 8 项）");
lines.push("");
for (const s of builtins) {
  lines.push(`### ${s.name} \`${s.id}\``);
  lines.push("");
  lines.push("```");
  lines.push(s.instructions);
  lines.push("```");
  lines.push("");
  lines.push(`- 自定义 Skill 存于 localStorage：\`yunhui-canvas-agent-skills-v1\`，加载时与内置列表合并`);
  lines.push("");
}

lines.push("## 2. 「漫剧全流程 · H3 画布版」管道提示词");
lines.push("");
lines.push("该 Skill 选中后，自动做剧流程按阶段调用以下四个提示词：");
lines.push("");
lines.push("### 2.1 SCREENPLAY_ADAPT_PROMPT（阶段 1：小说 → 精编剧本）");
lines.push("");
lines.push("```");
lines.push(prompts.SCREENPLAY_ADAPT_PROMPT);
lines.push("```");
lines.push("");
lines.push("### 2.2 COMIC_STAGE_A_PROMPT（阶段 2：剧本 → Stage A 资产 JSON）");
lines.push("");
lines.push("```");
lines.push(prompts.COMIC_STAGE_A_PROMPT);
lines.push("```");
lines.push("");
lines.push("### 2.3 COMIC_STAGE_A_METADATA_REPAIR_PROMPT（阶段 2b：Stage A 短元数据修复）");
lines.push("");
lines.push("```");
lines.push(prompts.COMIC_STAGE_A_METADATA_REPAIR_PROMPT);
lines.push("```");
lines.push("");
lines.push("### 2.4 SOL_SHOT_PLAN_PROMPT（阶段 3：剧本片段 → H3 分镜 JSON）");
lines.push("");
lines.push("```");
lines.push(prompts.SOL_SHOT_PLAN_PROMPT);
lines.push("```");
lines.push("");

const out = join(root, "docs", "canvas-skills.md");
mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, lines.join("\n"), "utf8");
console.log(`written: ${out} (${builtins.length} skills, ${Object.keys(prompts).length} prompts)`);
