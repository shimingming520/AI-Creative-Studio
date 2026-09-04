import { spawn } from "node:child_process";
import { createServer } from "node:net";
import { once } from "node:events";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const node = process.execPath;
const viteCli = path.join(root, "node_modules", "vite", "bin", "vite.js");
const electronCli = path.join(root, "node_modules", "electron", "cli.js");
const port = 5173;

const vite = spawn(
  node,
  [
    viteCli,
    "--config",
    path.join(root, "ui-src", "vite.config.mts"),
    "--host",
    "127.0.0.1",
    "--port",
    String(port),
  ],
  {
    cwd: root,
    stdio: "inherit",
    env: process.env,
  },
);

await waitForPort("127.0.0.1", port, 30_000);

const electron = spawn(node, [electronCli, "."], {
  cwd: root,
  stdio: "inherit",
  env: { ...process.env, ELECTRON_RENDERER_URL: `http://127.0.0.1:${port}` },
});

const stop = () => {
  if (!vite.killed) vite.kill();
  if (!electron.killed) electron.kill();
};
process.on("SIGINT", stop);
process.on("SIGTERM", stop);
electron.on("exit", (code, signal) => {
  stop();
  process.exit(code ?? (signal ? 1 : 0));
});
await once(electron, "exit");

function waitForPort(host, targetPort, timeoutMs) {
  return new Promise((resolve, reject) => {
    const started = Date.now();
    const probe = () => {
      const socket = createServer();
      socket.once("error", () => {
        socket.close();
        if (Date.now() - started > timeoutMs) reject(new Error("Vite 启动超时"));
        else setTimeout(probe, 150);
      });
      socket.once("listening", () => {
        socket.close(() => setTimeout(probe, 150));
      });
    };
    const checkHttp = () => {
      fetch(`http://${host}:${targetPort}`).then(() => resolve()).catch(() => {
        if (Date.now() - started > timeoutMs) reject(new Error("Vite 启动超时"));
        else setTimeout(checkHttp, 150);
      });
    };
    checkHttp();
  });
}
