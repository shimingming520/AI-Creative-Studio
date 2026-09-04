import WebSocket from "ws";
const ts = await (await fetch("http://127.0.0.1:9223/json/list")).json();
const t = ts.find((x) => x.type === "page" && /serpentHosted/.test(x.url));
if (!t) throw new Error("no target");
const ws = new WebSocket(t.webSocketDebuggerUrl);
await new Promise((resolve, reject) => { ws.on("open", resolve); ws.on("error", reject); });
let id = 0; const pending = new Map();
ws.on("message", (d) => { const m = JSON.parse(d); if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); } });
const evalJs = (expression) => new Promise((resolve, reject) => { const i = ++id; pending.set(i, (m) => m.error ? reject(m.error) : resolve(m.result?.result?.value)); ws.send(JSON.stringify({ id: i, method: "Runtime.evaluate", params: { expression, awaitPromise: true, returnByValue: true } })); });
const register = process.argv.includes('--register');
if (register) {
  console.log(JSON.stringify(await evalJs(`(() => {
    window.__rsOpenViewEvents = [];
    window.__rsOpenViewDispose?.();
    window.__rsOpenViewDispose = window.serpent?.host?.onOpenView?.((viewId) => window.__rsOpenViewEvents.push(viewId));
    return { registered: Boolean(window.__rsOpenViewDispose), events: window.__rsOpenViewEvents };
  })()`), null, 2));
}
console.log(JSON.stringify(await evalJs(`(() => ({
  url: location.href,
  openViewEvents: window.__rsOpenViewEvents || null,
  text: document.body.innerText.slice(0, 1800),
  buttons: [...document.querySelectorAll('button')].map(b => b.textContent.trim()).slice(0, 60),
  rsClasses: [...document.querySelectorAll('[class*=rs-]')].slice(0, 50).map(e => String(e.className))
  ,v2Wrap: Boolean(document.querySelector('#v2-wrap'))
  ,v2Text: document.querySelector('#v2-wrap')?.textContent?.slice(0, 1200) || ''
}))()`), null, 2));
ws.close();
