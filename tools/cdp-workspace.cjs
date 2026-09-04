const http = require("node:http");
const WebSocket = require("ws");
function get(path) {
  return new Promise((resolve, reject) => {
    http.get({ host: "127.0.0.1", port: 9223, path }, (res) => {
      let data = "";
      res.on("data", (c) => (data += c));
      res.on("end", () => resolve(JSON.parse(data)));
    }).on("error", reject);
  });
}
(async () => {
  const targets = await get("/json/list");
  const main = targets.find((t) => t.url.includes("YUH-Studio/dev-src/renderer/index.html"));
  const ws = new WebSocket(main.webSocketDebuggerUrl);
  let id = 0; const pending = new Map();
  function send(method, params) { return new Promise((r) => { const m = ++id; pending.set(m, r); ws.send(JSON.stringify({ id: m, method, params })); }); }
  ws.on("message", (m) => { const msg = JSON.parse(m.toString()); if (msg.id && pending.has(msg.id)) { pending.get(msg.id)(msg); pending.delete(msg.id); } });
  await new Promise((r) => ws.on("open", r));
  const evalJs = (e) => send("Runtime.evaluate", { expression: e, awaitPromise: true, returnByValue: true });
  const r = await evalJs("(async () => await window.h3.workspace.get())()");
  console.log("WORKSPACE.GET =>", JSON.stringify(r.result && r.result.result && r.result.result.value, null, 1));
  ws.close(); process.exit(0);
})().catch((e) => { console.error("ERR", e); process.exit(1); });
