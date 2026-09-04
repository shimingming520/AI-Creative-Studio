// CDP probe: dump Serpent embedded view state (debug helper).
import WebSocket from "ws";

const CDP_PORT = 9223;
async function main() {
  const targets = await (await fetch(`http://127.0.0.1:${CDP_PORT}/json/list`)).json();
  const t = targets.find((x) => x.type === "page" && /serpentHosted|main_window/.test(x.url));
  if (!t) {
    console.log("no serpent target:", targets.map((x) => x.url.slice(0, 90)).join(" | "));
    process.exit(1);
  }
  console.log("target:", t.url.slice(0, 110));
  const ws = new WebSocket(t.webSocketDebuggerUrl);
  await new Promise((res, rej) => {
    ws.on("open", res);
    ws.on("error", rej);
  });
  let id = 0;
  const pending = new Map();
  ws.on("message", (d) => {
    const m = JSON.parse(d.toString());
    if (m.id && pending.has(m.id)) {
      pending.get(m.id)(m);
      pending.delete(m.id);
    }
  });
  const send = (method, params = {}) =>
    new Promise((resolve, reject) => {
      const i = ++id;
      pending.set(i, (m) =>
        m.error ? reject(new Error(JSON.stringify(m.error))) : resolve(m.result),
      );
      ws.send(JSON.stringify({ id: i, method, params }));
    });
  const r = await send("Runtime.evaluate", {
    expression: `(() => {
      const root = document.getElementById('root');
      return {
        readyState: document.readyState,
        hasRoot: Boolean(root),
        rootChildren: root ? root.childElementCount : -1,
        appShell: Boolean(document.querySelector('.app-shell')),
        rsRoot: Boolean(document.querySelector('.rs-root')),
        rsTitle: document.querySelector('.rs-title')?.textContent || null,
        hostApi: Boolean(window.serpent && window.serpent.host),
        hostIsHosted: window.serpent && window.serpent.host ? window.serpent.host.isHosted() : null,
        bodyClasses: document.body.className,
        firstText: root ? (root.textContent || '').slice(0, 160) : '',
      };
    })()`,
    awaitPromise: true,
    returnByValue: true,
  });
  console.log(JSON.stringify(r.result?.value, null, 2));
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
