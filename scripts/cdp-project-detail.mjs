import WebSocket from 'ws';
const ts = await (await fetch('http://127.0.0.1:9223/json/list')).json();
const target = ts.find((x) => x.type === 'page' && /serpentHosted/.test(x.url));
const ws = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((resolve, reject) => { ws.on('open', resolve); ws.on('error', reject); });
let id = 0; const pending = new Map();
ws.on('message', (d) => { const m = JSON.parse(d); if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); } });
const result = await new Promise((resolve, reject) => {
  const messageId = ++id;
  pending.set(messageId, (m) => m.error ? reject(m.error) : resolve(m.result?.result?.value));
  ws.send(JSON.stringify({ id: messageId, method: 'Runtime.evaluate', params: { expression: `(async () => { const state = await window.serpent.host.projectsLoad(); return JSON.stringify((state.projects || []).find((project) => project.title === 'IndexTTS2') || null, null, 2); })()`, awaitPromise: true, returnByValue: true } }));
});
console.log(result);
ws.close();
