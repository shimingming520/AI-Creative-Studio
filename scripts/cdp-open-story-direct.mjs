import WebSocket from "ws";
const targets = await (await fetch("http://127.0.0.1:9223/json/list")).json();
const target = targets.find((item) => item.url.includes("dev-src/renderer"));
const serpentTarget = targets.find((item) => item.url.includes("serpentHosted=1"));
const ws = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((resolve, reject) => { ws.on("open", resolve); ws.on("error", reject); });
let id = 0; const pending = new Map();
ws.on("message", (data) => { const m = JSON.parse(data); if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); } else if (m.method === "Runtime.exceptionThrown" || m.method === "Runtime.consoleAPICalled") console.log("event", JSON.stringify(m)); });
const evaluate = (expression) => new Promise((resolve, reject) => { const callId = ++id; pending.set(callId, (m) => m.error ? reject(m.error) : resolve(m.result?.result?.value)); ws.send(JSON.stringify({ id: callId, method: "Runtime.evaluate", params: { expression, awaitPromise: true, returnByValue: true } })); });
console.log("api", await evaluate("typeof window.h3?.serpent?.openView"));
console.log("host", await evaluate("(() => ({ serpent: typeof window.serpent, host: typeof window.serpent?.host, open: typeof window.serpent?.host?.onOpenView, hosted: window.serpent?.host?.isHosted?.() }))()"));
await evaluate("(Runtime && true)").catch(() => {});
console.log("open", await evaluate("window.h3.serpent.openView('storyboard-script')"));
for (const ms of [100, 500, 1200, 2500]) {
  await new Promise((resolve) => setTimeout(resolve, ms));
  const currentTargets = await (await fetch("http://127.0.0.1:9223/json/list")).json();
  const hosted = currentTargets.find((item) => item.url.includes("serpentHosted=1"));
  const view = new WebSocket(hosted.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => { view.on("open", resolve); view.on("error", reject); });
  let viewId = 0; const viewPending = new Map();
  view.on("message", (data) => { const m = JSON.parse(data); if (m.id && viewPending.has(m.id)) { viewPending.get(m.id)(m); viewPending.delete(m.id); } });
  const inspect = await new Promise((resolve, reject) => { const callId = ++viewId; viewPending.set(callId, (m) => m.error ? reject(m.error) : resolve(m.result?.result?.value)); view.send(JSON.stringify({ id: callId, method: "Runtime.evaluate", params: { expression: "(() => ({overlay: !!document.querySelector('[data-studio-view=\\\"storyboard-script\\\"]'), workspace: !!document.querySelector('#storyWorkspaceRoot'), body: document.body.innerText.slice(0,120)}))()", returnByValue: true } })); });
  console.log("at", ms, inspect);
  view.close();
}
ws.close();
