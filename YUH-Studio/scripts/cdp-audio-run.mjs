// CDP driver part 3: E2E run — 音色设计 → Qwen3 TTS声音设计 → 运行音频工作流.
// Usage: node scripts/cdp-audio-run.mjs
import WebSocket from "ws";
import { writeFileSync } from "node:fs";

const CDP_PORT = 9223;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function getPageTarget() {
  for (let i = 0; i < 40; i++) {
    try {
      const res = await fetch(`http://127.0.0.1:${CDP_PORT}/json/list`);
      const targets = await res.json();
      const page = targets.find((t) => t.type === "page" && !t.url.startsWith("devtools://"));
      if (page) return page;
    } catch {}
    await sleep(500);
  }
  throw new Error("no page target");
}
const target = await getPageTarget();
const ws = new WebSocket(target.webSocketDebuggerUrl, { maxPayload: 64 * 1024 * 1024 });
await new Promise((res, rej) => { ws.on("open", res); ws.on("error", rej); });
let msgId = 0;
const pending = new Map();
ws.on("message", (d) => {
  const m = JSON.parse(d.toString());
  if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); }
});
const send = (method, params = {}) =>
  new Promise((resolve, reject) => {
    const id = ++msgId;
    pending.set(id, (m) => (m.error ? reject(new Error(method + ": " + JSON.stringify(m.error))) : resolve(m.result)));
    ws.send(JSON.stringify({ id, method, params }));
  });
async function evaluate(expression) {
  const res = await send("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true });
  if (res.exceptionDetails) throw new Error("eval: " + JSON.stringify(res.exceptionDetails).slice(0, 1500));
  return res.result?.value;
}
await send("Runtime.enable");
await send("Page.enable");

// --- helpers to interact with React-controlled inputs ---------------------------
const setTextareaValue = (sel, value) => evaluate(`(() => {
  const el = document.querySelector(${JSON.stringify(sel)});
  if (!el) return 'missing';
  const set = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value').set;
  set.call(el, ${JSON.stringify(value)});
  el.dispatchEvent(new Event('input', { bubbles: true }));
  el.dispatchEvent(new Event('change', { bubbles: true }));
  return 'ok:' + el.value;
})()`);

// 1. Open audio view ------------------------------------------------------------
await evaluate(`(() => { const b = Array.from(document.querySelectorAll('button')).find(b => (b.textContent||'').trim() === '生成音频'); if (b) b.click(); return !!b; })()`);
await sleep(1200);

// 2. Switch to 音色设计 tab ------------------------------------------------------
const tabClicked = await evaluate(`(() => {
  const t = Array.from(document.querySelectorAll('.audio-mode-tabs button')).find(b => /音色设计/.test(b.textContent));
  if (t) { t.click(); return t.textContent.trim(); }
  return null;
})()`);
console.log("TAB:", tabClicked);
await sleep(1500);

// 3. Select Qwen3 TTS声音设计 workflow ------------------------------------------
const picked = await evaluate(`(() => {
  const els = Array.from(document.querySelectorAll('button, [role="button"], [class*="card"], [class*="item"], li'));
  const c = els.find(e => /Qwen3 TTS声音设计/.test(e.textContent) && (e.textContent||'').length < 240);
  if (!c) return 'NOT FOUND: ' + [ ...document.querySelectorAll('button, [role="button"], li') ].map(e=>(e.textContent||'').trim()).filter(t=>t&&t.length<70).slice(0,30).join(' | ');
  c.click();
  return (c.textContent||'').trim().slice(0, 120);
})()`);
console.log("PICKED:", picked);
await sleep(3000);

// 4. Dump refs + text slots + run button state -----------------------------------
const state1 = await evaluate(`(() => {
  const ref = document.querySelector('.reference-section');
  const addBtns = Array.from(document.querySelectorAll('.reference-section button, .creation-column button')).slice(0,8).map(b=>(b.textContent||'').replace(/\\s+/g,' ').trim());
  const ta = document.querySelector('.creation-column textarea');
  const runBtn = Array.from(document.querySelectorAll('.creation-column button')).find(b => /运行音频工作流/.test(b.textContent));
  return {
    refTitle: ref ? (ref.querySelector('strong')?.textContent || '') : null,
    refDesc: ref ? (ref.querySelector('small')?.textContent || '') : null,
    addBtns,
    textarea: ta ? { val: ta.value, label: (ta.closest('div')?.querySelector('label')?.textContent||'').trim() } : null,
    runDisabled: runBtn ? runBtn.disabled : 'missing',
    hints: Array.from(document.querySelectorAll('.h3-model-picker-hint')).map(n=>n.textContent.trim()).slice(0,3),
    workflowCol: (document.querySelector('.panel:first-child')?.textContent || '').replace(/\\s+/g,' ').slice(0, 500),
  };
})()`);
console.log("STATE:", JSON.stringify(state1, null, 2));

// 5. Set prompt text --------------------------------------------------------------
console.log("SET TEXT:", await setTextareaValue('.creation-column textarea', '男低音，声音浑厚有磁性，语速缓慢的旁白音色，用于纪录片解说。'));

// 6. Click 运行音频工作流 ---------------------------------------------------------
const runResult = await evaluate(`(() => {
  const runBtn = Array.from(document.querySelectorAll('.creation-column button')).find(b => /运行音频工作流/.test(b.textContent));
  if (!runBtn) return 'missing run button';
  if (runBtn.disabled) return 'disabled';
  runBtn.click();
  return 'clicked';
})()`);
console.log("RUN:", runResult, "- waiting for task...");

// 7. Poll tasks -------------------------------------------------------------------
let last = "";
for (let i = 0; i < 60; i++) {
  await sleep(4000);
  const snapshot = await evaluate(`(() => window.h3.tasks.list() )()`).then((v) => JSON.stringify(v));
  if (snapshot !== last) {
    last = snapshot;
    console.log("TASKS@" + i, snapshot.slice(0, 700));
  } else {
    console.log("TASKS@" + i, "(unchanged)");
  }
  const t = JSON.parse(snapshot).find((x) => x.kind === "custom-workflow");
  if (t && ["completed", "failed", "error", "cancelled"].includes(t.status)) {
    console.log("FINAL:", JSON.stringify(t, null, 2).slice(0, 1500));
    break;
  }
}

// 8. Screenshot result card --------------------------------------------------------
const cards = await evaluate(`(() => Array.from(document.querySelectorAll('.audio-output-card')).map(c => (c.textContent||'').replace(/\\s+/g,' ').trim().slice(0,150)))()`);
console.log("OUTPUT CARDS:", JSON.stringify(cards));
const shot = await send("Page.captureScreenshot", { format: "png" });
writeFileSync("scripts/audio-run-result.png", Buffer.from(shot.data, "base64"));
console.log("SCREENSHOT: scripts/audio-run-result.png");
ws.close();
process.exit(0);
