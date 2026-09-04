import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    lib: {
      entry: 'src/worker/index.ts',
      formats: ['cjs'],
      fileName: () => 'library_worker.js',
    },
    rollupOptions: {
      external: [
        'better-sqlite3', 'koffi', 'sharp', 'trash', 'exifr', '@napi-rs/canvas',
        /^node:/u,
        'fs', 'path', 'os', 'stream', 'util', 'crypto', 'zlib', 'http', 'https',
        'http2', 'child_process', 'url', 'buffer', 'events', 'assert', 'querystring',
        'net', 'tls', 'worker_threads', 'dgram', 'dns', 'domain', 'module',
        'perf_hooks', 'process', 'punycode', 'repl', 'string_decoder', 'timers',
        'tty', 'v8', 'vm', 'readline', 'fs/promises', 'stream/promises',
      ],
    },
  },
});
