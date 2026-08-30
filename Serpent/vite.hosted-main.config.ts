import { defineConfig } from "vite";
// Hosted-mode build wrapper: identical to vite.main.config.ts except the
// externals list also keeps `electron` and all node:* builtins as real
// requires (Vite lib builds default to browser-compat shims otherwise).
// Standalone forge builds are unaffected; this config is only used by the
// serpent-host feasibility integration.
export default defineConfig({
  build: {
    outDir: ".vite/hosted-build",
    emptyOutDir: true,
    minify: false,
    lib: {
      entry: "src/main/index.ts",
      formats: ["cjs"],
      fileName: () => "main.js",
    },
    rollupOptions: {
      external: [
        "electron",
        "better-sqlite3",
        "koffi",
        "libarchive-wasm",
        /^node:/u,
        // Bare (non node:-prefixed) builtins referenced by third-party deps
        // (adm-zip/yauzl use `require('fs')` etc.). Without this, Vite rewrites
        // them to `__vite-browser-external` shims that throw at runtime.
        "fs",
        "path",
        "os",
        "stream",
        "util",
        "crypto",
        "zlib",
        "http",
        "https",
        "http2",
        "child_process",
        "url",
        "buffer",
        "events",
        "assert",
        "querystring",
        "net",
        "tls",
        "worker_threads",
        "dgram",
        "dns",
        "domain",
        "module",
        "perf_hooks",
        "process",
        "punycode",
        "repl",
        "string_decoder",
        "timers",
        "tty",
        "v8",
        "vm",
        "readline",
        "fs/promises",
        "stream/promises",
      ],
    },
  },
});
