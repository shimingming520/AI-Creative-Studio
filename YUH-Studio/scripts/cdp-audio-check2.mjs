// CDP driver part 2: select a workflow item, dump parameter fields, screenshot.
// Usage: node scripts/cdp-audio-check2.mjs
import WebSocket from "ws";
import { writeFileSync } from "node:fs";

const CDP_PORT = 9223;

async function getPageTarget() {
  const res = await fetch(`http://127.0.0.1:${CDP_PORT}/json/list`);
  const targets = await res.json();
  return targets.find((t) => t.type === "page" && !t.url.startsWith("devtools://"));
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
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
await send("Runtime.enable");
await send("Page.enable");

// List workflow items (find clickable cards whose text mentions .json)
const items = await evaluate(
  `Array.from(document.querySelectorAll('button, [role="button"], [class*="card"], [class*="item"], li'))
     .map(e => (e.textContent||'').trim())
     .filter(t => /\.json/.test(t) && t.length < 220)
     .filter((t, i, a) => a.indexOf(t) === i)
     .slice(0, 12)`,
);
console.log("WORKFLOW ITEMS:\n" + items.join("\n---\n"));

// Click the IndexTTS item (contains both 语音生成 and .json text)
const clickedName = await evaluate(
  `(() => {
     const els = Array.from(document.querySelectorAll('button, [role="button"], [class*="card"], [class*="item"], li'));
     const c = els.find(e => /IndexTTS/.test((e.textContent||'').trim()) && (e.textContent||'').trim().length < 300);
     if (!c) return null;
     c.click();
     return (c.textContent||'').trim().slice(0, 200);
   })()`,
);
console.log("CLICKED ITEM:", clickedName);
await sleep(3500);

const beforeRun = await evaluate(
  `(() => {
     const cc = document.querySelector('.creation-column');
     const txt = (n) => n ? n.textContent.replace(/\\s+/g, ' ').trim() : null;
     return {
       creation: txt(cc).slice(0, 1600),
       textareas: Array.from(document.querySelectorAll('.creation-column textarea')).map(t => ({ ph: t.placeholder||'', val: (t.value||'').slice(0,80), cls: t.className })),
       inputs: Array.from(document.querySelectorAll('.creation-column input')).map(i => ({ type: i.type, val: (i.value||'').slice(0,40), place: i.placeholder||'' })),
       buttons: Array.from(document.querySelectorAll('.creation-column button')).map(b => (b.textContent||'').trim()).filter(Boolean).slice(0, 20),
       slotLabels: Array.from(document.querySelectorAll('[class*="slot"]')).map(n => (n.textContent||'').replace(/\\s+/g,' ').trim()).filter(t => t && t.length < 60).slice(0, 25),
     };
   })()`,
);
console.log("BEFORE RUN:", JSON.stringify(beforeRun, null, 2));

const shot = await send("Page.captureScreenshot", { format: "png" });
writeFileSync("scripts/audio-studio-selected.png", Buffer.from(shot.data, "base64"));
console.log("SCREENSHOT: scripts/audio-studio-selected.png");
ws.close();
process.exit(0);
