// CDP driver: verify the 生成音频 (AudioGenerationStudio) module in the running YUH Studio app.
// Usage: node scripts/cdp-audio-check.mjs
import WebSocket from "ws";
import { writeFileSync } from "node:fs";

const CDP_PORT = 9223;

async function getPageTarget() {
  for (let i = 0; i < 40; i++) {
    try {
      const res = await fetch(`http://127.0.0.1:${CDP_PORT}/json/list`);
      const targets = await res.json();
      const page = targets.find(
        (t) => t.type === "page" && !t.url.startsWith("devtools://"),
      );
      if (page) return page;
    } catch {
      /* app still booting */
    }
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error("no page target found on CDP port");
}

const target = await getPageTarget();
console.log("TARGET:", target.title, "|", target.url);
const ws = new WebSocket(target.webSocketDebuggerUrl, { maxPayload: 64 * 1024 * 1024 });
await new Promise((resolve, reject) => {
  ws.on("open", resolve);
  ws.on("error", reject);
});

let msgId = 0;
const pending = new Map();
ws.on("message", (data) => {
  const msg = JSON.parse(data.toString());
  if (msg.id && pending.has(msg.id)) {
    pending.get(msg.id)(msg);
    pending.delete(msg.id);
  }
});
function send(method, params = {}) {
  return new Promise((resolve, reject) => {
    const id = ++msgId;
    pending.set(id, (msg) => (msg.error ? reject(new Error(method + ": " + JSON.stringify(msg.error))) : resolve(msg.result)));
    ws.send(JSON.stringify({ id, method, params }));
  });
}
async function evaluate(expression, awaitPromise = true) {
  const res = await send("Runtime.evaluate", {
    expression,
    awaitPromise,
    returnByValue: true,
  });
  if (res.exceptionDetails) {
    throw new Error("eval failed: " + JSON.stringify(res.exceptionDetails, null, 2).slice(0, 2000));
  }
  return res.result?.value;
}
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

await send("Runtime.enable");
await send("Page.enable");

// ---- 1. Rail button presence -------------------------------------------------
const railText = await evaluate(
  `Array.from(document.querySelectorAll('button')).map(b => (b.textContent||'').trim()).filter(t => t.includes('生成音频') || t.includes('本地生图') || t.includes('H3 视频'))`,
);
console.log("RAIL BUTTONS:", JSON.stringify(railText));

// ---- 2. Click 生成音频 and wait for the studio --------------------------------
const clicked = await evaluate(
  `(() => { const b = Array.from(document.querySelectorAll('button')).find(b => (b.textContent||'').trim() === '生成音频'); if (!b) return false; b.click(); return true; })()`,
);
console.log("CLICKED:", clicked);
await sleep(1500);

const studio = await evaluate(
  `(() => {
     const tabs = document.querySelector('.audio-mode-tabs');
     const area = document.querySelector('.audio-studio-area') || document.body;
     return {
       modeTabs: tabs ? Array.from(tabs.querySelectorAll('button')).map(b => (b.textContent||'').trim()) : null,
       workflowItems: Array.from(document.querySelectorAll('[class*="workflow" i]')).map(n => (n.textContent||'').trim()).filter(Boolean).slice(0, 30),
       hasWorkspaceClass: !!document.querySelector('.workspace'),
       viewHeading: (document.querySelector('.workspace h2, .workspace h1, .creation-column h2, .creation-column h1')?.textContent || '').trim(),
     };
   })()`,
);
console.log("STUDIO:", JSON.stringify(studio, null, 2));

// ---- 3. Pick first workflow (语音生成 → 音频/语音生成) --------------------------
const picked = await evaluate(
  `(() => {
     const els = Array.from(document.querySelectorAll('button, [role="button"], li'));
     const wf = els.find(e => /音频\\/语音生成|语音生成/.test((e.textContent||'').trim()) && (e.textContent||'').trim().length < 40);
     if (!wf) return 'no-workflow-el';
     wf.click();
     return (wf.textContent||'').trim();
   })()`,
);
console.log("PICKED:", picked);
await sleep(3000);

// ---- 4. Dump panel state after inspect/validate --------------------------------
const panel = await evaluate(
  `(() => {
     const q = (sel) => Array.from(document.querySelectorAll(sel));
     return {
       textareas: q('.audio-slot-textarea, textarea').slice(0, 8).map(t => ({ ph: t.placeholder || '', val: (t.value||'').slice(0, 60) })),
       refs: q('.audio-ref-card, [class*="ref"]').slice(0, 6).map(n => (n.textContent||'').trim().slice(0, 80)),
       modelRows: q('[class*="model"]').slice(0, 8).map(n => (n.textContent||'').trim().slice(0, 100)),
       validation: (document.querySelector('.validation-panel, [class*="validation"]')?.textContent || '').slice(0, 300),
       duration: q('input').map(i => ({ t: i.type, val: i.value, name: i.name || i.placeholder })).filter(i => /duration|秒|steps|cfg|seed/i.test((i.val||'') + (i.name||''))).slice(0, 10),
       previewArea: (document.querySelector('.right-column')?.textContent || '').slice(0, 200),
     };
   })()`,
);
console.log("PANEL:", JSON.stringify(panel, null, 2));

// ---- 5. Screenshot ------------------------------------------------------------
const shot = await send("Page.captureScreenshot", { format: "png" });
writeFileSync("scripts/audio-studio-check.png", Buffer.from(shot.data, "base64"));
console.log("SCREENSHOT: scripts/audio-studio-check.png");

ws.close();
process.exit(0);
