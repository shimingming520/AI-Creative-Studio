import WebSocket from "ws";

const DEBUG_URL = "http://127.0.0.1:9223/json/list";
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function connect(target) {
  const socket = new WebSocket(target.webSocketDebuggerUrl);
  let sequence = 0;
  const pending = new Map();
  socket.on("message", (data) => {
    const message = JSON.parse(data);
    if (message.id && pending.has(message.id)) {
      pending.get(message.id)(message);
      pending.delete(message.id);
    } else if (message.method === "Runtime.exceptionThrown" || message.method === "Runtime.consoleAPICalled") {
      console.log("runtime-event", JSON.stringify(message));
    }
  });
  return new Promise((resolve, reject) => {
    socket.on("open", () => {
      socket.send(JSON.stringify({ id: 0, method: "Runtime.enable" }));
      resolve({
      close: () => socket.close(),
      evaluate: (expression) => new Promise((done, fail) => {
        const id = ++sequence;
        pending.set(id, (message) => message.error ? fail(message.error) : done(message.result?.result?.value));
        socket.send(JSON.stringify({
          id,
          method: "Runtime.evaluate",
          params: { expression, awaitPromise: true, returnByValue: true },
        }));
      }),
      });
    });
    socket.on("error", reject);
  });
}

const targets = await (await fetch(DEBUG_URL)).json();
const yuhTarget = targets.find((target) => target.type === "page" && target.url.includes("dev-src/renderer"));
const serpentTarget = targets.find((target) => target.type === "page" && target.url.includes("serpentHosted=1"));
if (!yuhTarget || !serpentTarget) throw new Error("未找到 YUH 或 Serpent 调试页面");

const yuh = await connect(yuhTarget);
const serpent = await connect(serpentTarget);
try {
  const clicked = await yuh.evaluate(`(() => {
    const button = document.querySelector('aside.left-rail nav .yuh-studio-entry[data-entry="storyboard-script"]');
    button?.click();
    return Boolean(button);
  })()`);
  if (!clicked) throw new Error("未找到剧本工作室入口");

  await delay(2500);
  console.log("host-state", await serpent.evaluate(`(() => ({ serpent: typeof window.serpent, host: typeof window.serpent?.host, hosted: window.serpent?.host?.isHosted?.(), open: typeof window.serpent?.host?.onOpenView }))()`));
  console.log("after-click-yuh", await yuh.evaluate(`(() => ({
    buttons: [...document.querySelectorAll('aside.left-rail nav button')].map((button) => ({ entry: button.dataset.entry, text: button.textContent?.trim(), className: button.className })),
    serpent: window.h3?.serpent ? { status: window.h3.serpent.status ? 'present' : 'no-status' } : null,
  }))()`));
  console.log("after-click-serpent", await serpent.evaluate(`(() => ({ body: document.body.innerText.slice(0, 500), root: document.querySelector('#root')?.innerHTML.slice(-1000) }))()`));
  const story = await serpent.evaluate(`(() => ({
    overlay: Boolean(document.querySelector('[data-studio-view="storyboard-script"]')),
    workspace: Boolean(document.querySelector('#storyWorkspaceRoot')),
    title: document.querySelector('#storyWorkspaceRoot')?.textContent?.trim().slice(0, 160) || '',
  }))()`);
  if (!story.overlay || !story.workspace) {
    throw new Error(`剧本工作室没有完成挂载：${JSON.stringify(story)}`);
  }

  await yuh.evaluate(`(() => {
    const button = document.querySelector('aside.left-rail nav .yuh-serpent-entry[data-entry="serpent"]');
    button?.click();
    return Boolean(button);
  })()`);
  await delay(500);
  const returned = await serpent.evaluate(`(() => !document.querySelector('[data-studio-view="storyboard-script"]'))()`);
  if (!returned) throw new Error("无法从剧本工作室返回资源管理");
  console.log(JSON.stringify({ passed: true, story }, null, 2));
} finally {
  yuh.close();
  serpent.close();
}
