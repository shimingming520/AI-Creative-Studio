import { defineConfig } from "vite";

/**
 * Hosted-mode preload build: identical to forge's preload output except the
 * external list keeps `electron` and all node:* builtins as real requires.
 * A plain `vite build` bundles the `electron` npm package itself (its
 * index.js references `__dirname`/install.js), which throws
 * "ReferenceError: __dirname is not defined" inside a sandboxed preload — the
 * Serpent renderer then boots without window.serpent and the hosted
 * resource view appears dead.
 */
export default defineConfig({
  build: {
    outDir: ".vite/build",
    emptyOutDir: false,
    minify: false,
    lib: {
      entry: "src/preload/index.ts",
      formats: ["cjs"],
      fileName: () => "index.js",
    },
    rollupOptions: {
      external: [
        "electron",
        "better-sqlite3",
        "koffi",
        "libarchive-wasm",
        /^node:/u,
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
