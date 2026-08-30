// Assemble the hosted-build dir: main.js (rebuilt) + all other Serpent runtime
// bundles that main.js resolves relative to __dirname.
// Sources: .vite/build (forge artifacts) and dist/ (fresh vite worker rebuild).
const fs = require("fs");
const path = require("path");

const root = "F:/PyCharm_Project/AI-Creative-Studio/Serpent";
const src = path.join(root, ".vite", "build");
const dst = path.join(root, ".vite", "hosted-build");

const keep = [
  "index.js", // main-window preload
  "offscreen.js", // offscreen thumbnail preload
  "critical-confirmation.js",
  "plugin_standard_host.js",
  "plugin_trusted_host.js",
  "script_runtime_utility.js",
];

for (const name of fs.readdirSync(src)) {
  if (!keep.includes(name)) continue;
  fs.copyFileSync(path.join(src, name), path.join(dst, name));
  console.log("copied (build)", name);
}
// Worker: always the forge-built one (vite standalone rebuild browser-ifies
// node builtins and breaks the worker). Forge builds are ABI-correct.
fs.copyFileSync(path.join(src, "library_worker.js"), path.join(dst, "library_worker.js"));
console.log("copied (build worker) library_worker.js");
for (const name of fs.readdirSync(src)) {
  if (/^pdf-.*\.js$/.test(name)) {
    fs.copyFileSync(path.join(src, name), path.join(dst, name));
    console.log("copied (build pdf)", name);
  }
}
console.log("done. dst listing:", fs.readdirSync(dst).join(", "));
